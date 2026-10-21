"""Optional repo-owned context pages; evidence connections never grant update authority."""
from datetime import date
import json
from pathlib import Path
import posixpath
import re
import uuid

FILE = 'PROJECT_CONTEXT.md'
SLUG = re.compile(r'[a-z][a-z0-9]*(?:-[a-z0-9]+)*')


def text(value, maximum=1200):
    if (not isinstance(value, str) or not value.strip() or len(value) > maximum
            or any(ord(c) < 32 for c in value)):
        raise ValueError('Invalid context text')
    return value


def keys(value, expected):
    if not isinstance(value, dict) or set(value) != set(expected.split()):
        raise ValueError('Unexpected context fields')


def validate(value):
    marked = isinstance(value, dict) and ('agent_generated' in value or 'human_reviewed' in value)
    keys(value, 'schema identity name reviewed_on topics summary related_projects' + (' path_basis' if isinstance(value, dict) and 'path_basis' in value else '') + (' agent_generated human_reviewed' if marked else ''))
    if marked and (value['agent_generated'] is not True or value['human_reviewed'] is not False):
        raise ValueError('Generated context must declare agent_generated true and human_reviewed false')
    if value['schema'] != 'project-context-v1':
        raise ValueError('Unsupported context schema')
    text(value['identity'], 200); text(value['name'], 150)
    if value.get('path_basis', 'workspace') not in ('workspace', 'repository'):
        raise ValueError('Unsupported evidence path basis')
    if value['identity'].startswith('project:') and str(uuid.UUID(value['identity'][8:])) != value['identity'][8:]:
        raise ValueError('Project identity must use its canonical profile UUID')
    if value['reviewed_on'] is not None and date.fromisoformat(value['reviewed_on']).isoformat() != value['reviewed_on']:
        raise ValueError('Invalid review date')
    if not isinstance(value['topics'], list) or len(value['topics']) > 12:
        raise ValueError('Topics unavailable')
    if len(set(value['topics'])) != len(value['topics']) or any(not SLUG.fullmatch(t) for t in value['topics']):
        raise ValueError('Invalid topic')
    for field, count in [('summary', 8), ('related_projects', 8)]:
        if not isinstance(value[field], list) or len(value[field]) > count:
            raise ValueError('Context rows unavailable')
        for row in value[field]:
            expected = 'question answer evidence' if field == 'summary' else 'identity relationship description review_when evidence'
            keys(row, expected)
            for key in expected.split():
                if key != 'evidence':
                    text(row[key])
            if field == 'related_projects' and not SLUG.fullmatch(row['relationship']):
                raise ValueError('Invalid relationship')
            if not isinstance(row['evidence'], list) or not 1 <= len(row['evidence']) <= 4:
                raise ValueError('Evidence unavailable')
            for ref in row['evidence']:
                keys(ref, 'path sha256 excerpt')
                text(ref['path'], 400); text(ref['excerpt'], 1000)
                path = Path(ref['path'])
                if path.is_absolute() or path.as_posix() != ref['path'] or '..' in path.parts:
                    raise ValueError('Evidence path escapes owner')
                if not isinstance(ref['sha256'], str) or not re.fullmatch(r'[a-f0-9]{64}', ref['sha256']):
                    raise ValueError('Evidence digest unavailable')
    if value['reviewed_on'] is None and (value['summary'] or value['related_projects']):
        raise ValueError('Evidence interpretations require an explicit review date')
    return value


def render_document(value):
    """One source block owns both the readable tables and the Overview projection."""
    validate(value)
    repository = value.get('path_basis') == 'repository'
    root = value['identity'].removeprefix('workspace:') if value['identity'].startswith('workspace:') and not repository else ''
    def cell(s):
        return s.replace('|', '\\|')
    def links(row):
        return ', '.join('[' + Path(r['path']).name + '](' + posixpath.relpath(r['path'], root or '.') + ')' for r in row['evidence'])
    lines = ['# Project Context — ' + value['name'], '',
             ('Reviewed: ' + value['reviewed_on'] + '. This is a source-backed interpretation, not a live status or new acceptance record.' if value['reviewed_on'] else
              'Not yet reviewed. No goals, findings, accepted outcomes or related projects are established by this starter.'), '',
             'Project identity: `' + value['identity'] + '`', '',
             'Topics: ' + (', '.join('`' + t + '`' for t in value['topics']) or 'Not declared.'), '',
             '## At a glance', '', '| Question | Answer | Evidence |', '| --- | --- | --- |']
    for row in value['summary']:
        lines.append('| ' + cell(row['question']) + ' | ' + cell(row['answer']) + ' | ' + links(row) + ' |')
    if not value['summary']:
        lines.append('| Purpose, goals, findings and outcomes | Not established. Add reviewed interpretations with pinned source evidence. | None yet |')
    lines += ['', '## Related projects', '', '| Project | Relationship | Connection | Review when | Evidence |', '| --- | --- | --- | --- | --- |']
    for row in value['related_projects']:
        lines.append('| `' + cell(row['identity']) + '` | ' + row['relationship'] + ' | ' + cell(row['description']) + ' | ' + cell(row['review_when']) + ' | ' + links(row) + ' |')
    if not value['related_projects']:
        lines.append('| Not declared | — | No connection inferred | Review only after supporting evidence exists | None yet |')
    lines += ['', 'Topics aid discovery; they do not establish dependencies or classify AI sessions. Relationships identify review candidates only. No automatic downstream updates or runtime migration.', '',
              '## Agent-readable source', '',
              ('This block owns the tables above. After editing it, regenerate this page with `python3 scripts/project_context.py /absolute/PROJECT_CONTEXT.md` from this repo. Evidence paths are relative to this repository; keep other projects referenced by their stable identities. Validation checks table agreement and source pins, not acceptance or live state. Do not publish private context merely because a repo has publication intent.' if repository else
               'This block owns the tables above. After editing it, regenerate this page with the existing Workspace Context formatter: `python3 -m workspace_context.project_context /absolute/PROJECT_CONTEXT.md` from that package. The Overview refuses a page whose tables diverge from this block. Evidence hashes pin the reviewed source; changed or missing sources need review.'), '',
              '```json', json.dumps(value, indent=2, ensure_ascii=False), '```', '']
    if 'agent_generated' in value:
        lines[4:4] = ['Agent-generated interpretation; no explicit human review is recorded. The review date records agent review.', '']
        lines[:0] = ['---', 'agent_generated: true', 'human_reviewed: false', '---', '']
    return '\n'.join(lines)


def parse(raw):
    content = raw.decode('utf-8')
    blocks = re.findall(r'^```json\n(.*?)\n```$', content, re.M | re.S)
    if len(blocks) != 1:
        raise ValueError('One structured context block required')
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError('Duplicate context field')
            result[key] = value
        return result
    return validate(json.loads(blocks[0], object_pairs_hook=unique))


def check_page(root, relative, identity):
    """Portable structural/source-pin check; never reads another repo or updates it."""
    def read(relative, limit):
        path = root / relative
        if (Path(relative).is_absolute() or '..' in Path(relative).parts or path.resolve() != path
                or not path.is_file() or path.stat().st_size > limit):
            raise ValueError('Missing, redirected, escaping or oversized context source')
        return path.read_bytes()
    raw = read(relative, 65536)
    value = parse(raw)
    if value['identity'] != identity or value.get('path_basis') != 'repository':
        raise ValueError('Context must match profile identity and repository-relative evidence')
    if value['reviewed_on'] and date.fromisoformat(value['reviewed_on']) > date.today():
        raise ValueError('Context review date is in the future')
    if render_document(value).encode('utf-8') != raw:
        raise ValueError('Readable context tables differ from structured source')
    import hashlib
    for row in value['summary'] + value['related_projects']:
        for ref in row['evidence']:
            path = Path(ref['path'])
            if path.suffix.lower() != '.md' or any(part.startswith('.') or part in ('sessions', 'messages', 'credentials', 'secrets') for part in path.parts):
                raise ValueError('Only ordinary project Markdown can supply context evidence')
            body = read(ref['path'], 1024 * 1024)
            if hashlib.sha256(body).hexdigest() != ref['sha256'] or ref['excerpt'] not in ' '.join(body.decode('utf-8').split()):
                raise ValueError('Pinned context evidence changed or does not contain its excerpt')
    return value


if __name__ == '__main__':
    import sys
    path = Path(sys.argv[1]).absolute()
    if path.name != FILE or path.is_symlink() or path.resolve() != path or path.stat().st_size > 65536:
        raise ValueError('Owned absolute context page required')
    path.write_text(render_document(parse(path.read_bytes())), encoding='utf-8')
