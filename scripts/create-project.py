#!/usr/bin/env python3
"""Create a small maintained project; never initialize Git or publish."""
import argparse
import json
from pathlib import Path
import re
import shutil
import sys
import uuid

sys.dont_write_bytecode = True
from validate_project import local_file, validate_arcade, validate_publication

SOURCE = Path(__file__).resolve().parent.parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--name", required=True)
    parser.add_argument("--profile", choices=["standard", "tool", "experimental", "arcade", "disposable"], default="standard")
    parser.add_argument("--publication", choices=["local", "public-unenrolled", "enrolled"], default="local")
    parser.add_argument("--repository")
    parser.add_argument("--surface", action="append", default=[])
    parser.add_argument("--title")
    parser.add_argument("--summary")
    parser.add_argument("--adopt", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--with-relay", action="store_true")
    parser.add_argument("--with-ci", action="store_true", help="select read-only profile validation in GitHub Actions")
    parser.add_argument("--with-project-context", action="store_true", help="include an unreviewed Project Context page and portable formatter")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9._-]+", args.name) or args.name in [".", ".."]:
        parser.error("name must be a single safe project name")
    dest = args.destination.absolute()
    if dest.is_symlink() or any(p.is_symlink() for p in dest.parents):
        parser.error("destination and its parents must not be symlinks")
    if args.adopt:
        if not dest.is_dir():
            parser.error("adoption requires an existing directory")
        if (dest / "REPO_PROFILE.json").exists() or (dest / "REPO_PROFILE.json").is_symlink():
            parser.error("REPO_PROFILE.json already exists; preserve it and use explicit enrollment instead")
    elif dest.exists():
        parser.error("destination already exists; use --adopt to add missing files")
    if args.adopt and args.profile == "arcade":
        try:
            local_file(dest, "index.html")
            local_file(dest, "game.js")
            metadata = local_file(dest, "arcade.json")
            problems = validate_arcade(json.loads(metadata.read_text()))
            if metadata.stat().st_size > 4000:
                problems.append("arcade metadata exceeds website byte bound")
            if problems:
                parser.error("; ".join(problems))
        except (OSError, ValueError) as error:
            parser.error(f"Arcade adoption requires existing workshop game files: {error}")
    publication = {
        "state": args.publication, "repository": args.repository,
        "surfaces": sorted(set(args.surface)), "title": args.title or args.name,
        "summary": args.summary or "Local project; public summary has not been selected.",
        "consent": {"metadataSync": args.publication == "enrolled"},
    }
    errors = validate_publication(publication)
    if args.publication != "local" and not args.summary:
        errors.append("public metadata requires an explicit --summary")
    if "arcade-playable" in args.surface:
        errors.append("creation cannot certify a deployed browser workflow; select arcade-workshop")
    if any(s.startswith("arcade-") for s in args.surface) and args.profile != "arcade":
        errors.append("Arcade surfaces require the arcade profile")
    if args.profile == "disposable" and args.publication != "local":
        errors.append("disposable experiments remain local")
    if errors:
        parser.error("; ".join(errors))
    project_id = str(uuid.uuid4())
    files = {
        "README.md": f"# {args.name}\n\n{publication['summary']}\n\n## Ownership\nRecord the accountable owner and purpose here.\n\n## Validation\nRun `python3 scripts/validate_project.py .`. Add source checks as implementation grows.\n\n## Publication\n`REPO_PROFILE.json` owns publication intent. GitHub visibility and website recognition require separate verification. Internal plans, receipts and work history must remain private.\n",
        "AGENTS.md": f"# {args.name}\n\nMission: maintain the purpose described in README.md.\nPriorities: preserve user data, keep changes small, verify observable behavior.\nRead README.md, REPO_PROFILE.json and docs/decisions.md before structural changes.\nUse commands in REPO_PROFILE.json; no package manager is selected.\nKeep implementation in src/ and document boundaries before adding integrations.\nKeep secrets, private receipts, raw work history and generated artifacts out of public metadata.\nRun applicable checks and report changed files, results and skipped checks.\n",
        ".gitignore": ".DS_Store\n.env\n.env.*\n!.env.example\nnode_modules/\n__pycache__/\n.agent-runs/\n.agent-context/\nwork/\n",
        ".gitattributes": "* text=auto\n",
        "docs/decisions.md": "# Decisions\n\nRecord dated project decisions and their evidence here.\n",
        "contracts/schemas/repo-profile.schema.json": (SOURCE / "contracts/schemas/repo-profile.schema.json").read_text(),
        "scripts/validate_project.py": (SOURCE / "scripts/validate_project.py").read_text(),
    }
    if args.profile == "arcade" and not args.adopt:
        for name in ["index.html", "game.js"]:
            files[name] = (SOURCE / "templates/arcade" / name).read_text()
        files["arcade.json"] = json.dumps({"summary": args.summary or "Collect stars with keyboard or touch in a local static game.", "description": "Start, move to the star, pause and restart. This workshop has no deployed play URL.", "tags": ["collect"], "status": "workshop"}, indent=2) + "\n"
        files["README.md"] += "\n## Arcade workshop\nServe with `python3 -m http.server 8000 --bind 127.0.0.1`; open the local index.html.\nControls: arrows/WASD or touch; Start, Pause and Restart; P pauses, R restarts.\n[Arcade author contract](https://github.com/velcrafting/website2025/blob/main/src/app/arcade/AUTHOR_PROMPT.md).\nThe game makes no external requests. Keep workshop/no playUrl until the deployed HTTPS game passes an actual browser workflow. No model attribution is asserted. Deployment is a separate opt-in operation.\n"
    elif args.profile == "arcade":
        files["README.md"] += "\n## Existing Arcade workshop\nGame source and metadata were preserved. Verify actual keyboard/touch controls, fixed 4:3 layout, pause/restart and network behavior before publication.\n[Arcade author contract](https://github.com/velcrafting/website2025/blob/main/src/app/arcade/AUTHOR_PROMPT.md).\n"
    if args.profile == "arcade":
        files["docs/arcade-author-contract.md"] = (SOURCE / "templates/arcade/AUTHOR_CONTRACT.md").read_text()
        files["README.md"] += "\nThe [local author contract](docs/arcade-author-contract.md) is included for offline use; the upstream GitHub path may await publication.\n"
    if args.with_ci:
        files[".github/workflows/validate-project.yml"] = (SOURCE / "templates/validate-project.yml").read_text()
    if args.with_project_context:
        from project_context import render_document
        files["PROJECT_CONTEXT.md"] = render_document(dict(schema="project-context-v1", identity="project:" + project_id,
            name=args.name, reviewed_on=None, path_basis="repository", topics=[], summary=[], related_projects=[]))
        files["scripts/project_context.py"] = (SOURCE / "scripts/project_context.py").read_text()
        files["README.md"] += "\n## Project Context\n[Project Context](PROJECT_CONTEXT.md) holds optional reviewed goals, findings, topics and related projects. Its starter establishes no outcomes or relationships. Keep private context out of public publication metadata.\n"
        files["AGENTS.md"] += "\nRead PROJECT_CONTEXT.md when project purpose, research or related projects are relevant. Edit its structured source, then run the profile's formatProjectContext command. Topics aid discovery; connections recommend review and never authorize downstream updates.\n"
    if args.with_relay:
        relay = SOURCE / "skills/relay-board"
        for source in sorted(relay.rglob("*")):
            if source.is_file():
                files["skills/relay-board/" + str(source.relative_to(relay))] = source.read_text()
        config = json.loads(files["skills/relay-board/templates/project.json"])
        config.update(instance=f"project-{uuid.uuid4()}", title=args.name)
        files["skills/relay-board/templates/project.json"] = json.dumps(config, indent=2) + "\n"
        files["AGENTS.md"] += "\nRelay is optional; use skills/relay-board/SKILL.md only when useful and authorized. Preserve its board identity across worktrees.\n"
    profile = {
        "$schema": "./contracts/schemas/repo-profile.schema.json",
        "templateName": "Maintained Project Scaffold", "purpose": f"Maintained {args.name} project.",
        "project": {"id": project_id, "name": args.name, "kind": args.profile},
        "publication": publication,
        "rootPolicy": {"keepAtRoot": sorted(set(p.split("/")[0] for p in files) | {"REPO_PROFILE.json", "src"}), "rootDocsAllowed": [], "note": "Generated baseline; project owners extend applicable files and checks."},
        "canonicalPaths": {"docs": "docs/", "decisions": "docs/decisions.md", "profileSchema": "contracts/schemas/repo-profile.schema.json"},
        "commands": {"validateProject": "python3 scripts/validate_project.py ."},
        "readFirst": ["README.md", "AGENTS.md", "REPO_PROFILE.json", "docs/decisions.md"],
        "governanceLocked": ["REPO_PROFILE.json"], "downstreamScopes": [],
        "forbiddenRootDirectoriesBeforeProjectAdoption": [], "allowedTemplatePlaceholders": [],
        "qualityGate": ["python3 scripts/validate_project.py ."],
    }
    if args.profile == "arcade":
        profile["canonicalPaths"]["arcadeAuthorContract"] = "docs/arcade-author-contract.md"
    if args.with_project_context:
        profile["canonicalPaths"]["projectContext"] = "PROJECT_CONTEXT.md"
        profile["commands"]["formatProjectContext"] = "python3 scripts/project_context.py PROJECT_CONTEXT.md"
        profile["readFirst"].append("PROJECT_CONTEXT.md")
    # Adoption changes missing files only; nested symlinks and file/directory collisions fail before any write.
    planned = {}
    preserved = []
    files["REPO_PROFILE.json"] = json.dumps(profile, indent=2) + "\n"
    for name, content in files.items():
        target = dest / name
        for parent in [target, *target.parents]:
            if parent == dest.parent:
                break
            if parent.is_symlink():
                parser.error(f"refusing symlink: {parent}")
            if parent != target and parent.exists() and not parent.is_dir():
                parser.error(f"required directory is a file: {parent}")
        if target.exists():
            if not target.is_file():
                parser.error(f"required file is a directory: {target}")
            if name in {"scripts/validate_project.py", "contracts/schemas/repo-profile.schema.json", "scripts/project_context.py", "PROJECT_CONTEXT.md"} and target.read_text() != content:
                parser.error(f"existing validation/context resource differs: {name}; preserve it and review adoption explicitly")
            preserved.append(name)
        else:
            planned[name] = content
    if not args.dry_run:
        dest.mkdir(parents=True, exist_ok=args.adopt)
        if not args.adopt:
            (dest / "src").mkdir()
        for name, content in planned.items():
            target = dest / name
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("x") as handle:
                handle.write(content)
    print(json.dumps({"destination": str(dest), "dryRun": args.dry_run, "created": sorted(planned), "preserved": sorted(preserved), "publication": publication}, indent=2))


if __name__ == "__main__":
    main()
