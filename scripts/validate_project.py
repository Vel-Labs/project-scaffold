#!/usr/bin/env python3
"""Dependency-free lifecycle boundary checks; no network or publication effects."""
import json
from pathlib import Path
import re
import sys
import uuid

KINDS = {"standard", "tool", "experimental", "arcade", "disposable"}
SURFACES = {"projects", "case-study", "tools", "labs", "arcade-workshop", "arcade-playable"}


def plain_text(value, limit):
    return (isinstance(value, str) and 0 < len(value) <= limit and value == value.strip()
            and not re.search(r"[\x00-\x1f\x7f<>\[\]`]|(?:https?://|www\.|/Users/|/home/|\.\./)", value))


def validate_publication(value):
    errors = []
    if not isinstance(value, dict):
        return ["publication must be an object"]
    required = {"state", "repository", "surfaces", "title", "summary", "consent"}
    if set(value) != required:
        errors.append("publication requires exactly state, repository, surfaces, title, summary and consent")
    state = value.get("state")
    repo = value.get("repository")
    surfaces = value.get("surfaces")
    consent = value.get("consent")
    if not isinstance(state, str) or state not in {"local", "public-unenrolled", "enrolled"}:
        errors.append("unsupported publication state")
    if repo is not None and (not isinstance(repo, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9_.-]{1,100}", repo) or repo.split("/")[-1] in {".", ".."}):
        errors.append("repository must use a valid GitHub owner/repo identity")
    if not isinstance(surfaces, list) or any(not isinstance(s, str) or s not in SURFACES for s in surfaces) or (isinstance(surfaces, list) and len(surfaces) != len(set(s for s in surfaces if isinstance(s, str)))):
        errors.append("surfaces must contain unique supported values")
    if not plain_text(value.get("title"), 100) or not plain_text(value.get("summary"), 200):
        errors.append("title/summary must be bounded single-line plain text without URLs or internal paths")
    if not isinstance(consent, dict) or set(consent) != {"metadataSync"} or type(consent.get("metadataSync")) is not bool:
        errors.append("consent.metadataSync must be an explicit boolean enrollment intent")
    elif state == "enrolled":
        if not repo or not surfaces or not consent["metadataSync"]:
            errors.append("enrollment requires repository, surfaces and metadataSync intent")
    elif surfaces or consent["metadataSync"]:
        errors.append("unenrolled projects cannot select website surfaces or metadataSync")
    if state == "public-unenrolled" and not repo:
        errors.append("public-unenrolled requires repository identity")
    return errors


def local_file(root, relative):
    if not isinstance(relative, str) or not relative:
        raise ValueError("resource path must be a relative string")
    path = Path(relative)
    target = root / path
    if path.is_absolute() or ".." in path.parts or target.is_symlink() or any(p.is_symlink() for p in target.parents if p != root.parent):
        raise ValueError(f"unsafe resource path: {relative}")
    if not target.exists() or not target.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"missing or escaping resource: {relative}")
    return target


def validate_arcade(value):
    if not isinstance(value, dict):
        return ["arcade metadata must be an object"]
    errors = []
    if not plain_text(value.get("summary"), 200):
        errors.append("arcade summary must be bounded public text")
    if "description" in value and not plain_text(value["description"], 600):
        errors.append("arcade description must be bounded public text")
    tags = value.get("tags", [])
    if not isinstance(tags, list) or len(tags) > 5 or any(not plain_text(tag, 40) for tag in tags):
        errors.append("arcade tags must contain at most five bounded public strings")
    if value.get("status") != "workshop" or "playUrl" in value:
        errors.append("playable promotion requires the publication verifier and deployed browser proof; baseline validator certifies workshop only")
    return errors


def validate_project(root):
    errors = []
    try:
        profile = json.loads(local_file(root, "REPO_PROFILE.json").read_text())
        project = profile["project"]
        if str(uuid.UUID(project["id"])) != project["id"]:
            errors.append("project id must be a canonical UUID")
        if project["kind"] not in KINDS or not re.fullmatch(r"[A-Za-z0-9._-]+", project["name"]) or project["name"] in {".", ".."}:
            errors.append("invalid project identity or kind")
        errors.extend(validate_publication(profile["publication"]))
        if project["kind"] == "disposable" and profile["publication"]["state"] != "local":
            errors.append("disposable experiments remain local")
        for relative in [profile["$schema"], *profile["readFirst"], *profile["canonicalPaths"].values(), *profile["governanceLocked"]]:
            local_file(root, relative)
        for relative in [".gitignore", ".gitattributes", "scripts/validate_project.py"]:
            local_file(root, relative)
        if "projectContext" in profile["canonicalPaths"]:
            local_file(root, "scripts/project_context.py")
            from project_context import check_page
            check_page(root, profile["canonicalPaths"]["projectContext"], "project:" + project["id"])
        if any(s.startswith("arcade-") for s in profile["publication"]["surfaces"]) and project["kind"] != "arcade":
            errors.append("Arcade surfaces require arcade kind")
        if project["kind"] == "arcade":
            arcade_file = local_file(root, "arcade.json")
            errors.extend(validate_arcade(json.loads(arcade_file.read_text())))
            if arcade_file.stat().st_size > 4000:
                errors.append("arcade metadata exceeds website byte bound")
            if "arcade-playable" in profile["publication"]["surfaces"]:
                errors.append("arcade-playable requires the publication verifier")
            local_file(root, "index.html")
            local_file(root, "game.js")
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as error:
        errors.append(str(error))
    return errors


if __name__ == "__main__":
    target = Path(sys.argv[1] if len(sys.argv) > 1 else ".").absolute()
    failures = validate_project(target)
    print(json.dumps({"ok": not failures, "errors": failures}, indent=2))
    sys.exit(bool(failures))
