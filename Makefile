.PHONY: setup detect lint type test build e2e eval preview check ci

# The app lives in web/ or in the repo root.
WEB := $(if $(wildcard web/package.json),web,$(if $(wildcard package.json),.,))

setup:
	git config core.hooksPath .githooks
	@if [ -f pyproject.toml ]; then uv sync; fi
	@if [ -n "$(WEB)" ]; then npm ci --prefix $(WEB); fi

# A docs-only repo passes, so [SPEC] and [ARCH] PRs can merge. Code nobody tests fails.
detect:
	@if [ -z "$(WEB)" ] && [ ! -f pyproject.toml ]; then \
		if git ls-files | grep -qE '\.(ts|tsx|js|jsx|mjs|py)$$|package\.json$$|pyproject\.toml$$'; then \
			echo "make check: FAIL code found, but no package.json or pyproject.toml in the root or web/"; exit 1; \
		fi; \
		echo "make check: no app yet, nothing to test"; \
	fi

lint:
	@if [ -f pyproject.toml ]; then uv run ruff check .; fi
	@if [ -n "$(WEB)" ]; then \
		grep -Eq '"lint": *"[^"]*(eslint|biome)' $(WEB)/package.json || { \
			echo "make lint: FAIL the lint script must run eslint or biome, not only a type check"; exit 1; }; \
		npm run lint --prefix $(WEB); \
	fi

type:
	@if [ -d app ] && [ -f pyproject.toml ]; then uv run mypy app; fi
	@if [ -n "$(WEB)" ]; then npm run typecheck --prefix $(WEB); fi

test:
	@if [ -f pyproject.toml ]; then uv run pytest -q; fi
	@if [ -n "$(WEB)" ]; then npm test --prefix $(WEB); fi

build:
	@if [ -n "$(WEB)" ]; then npm run build --prefix $(WEB); fi

e2e:
	@if [ -n "$(WEB)" ]; then cd $(WEB) && npx playwright install chromium && npx playwright test; fi

preview:
	@if [ -n "$(WEB)" ]; then npm run dev --prefix $(WEB) -- --port 3001; else echo "make preview: no web app here"; fi

eval:
	@if [ -f evals/run.py ]; then uv run python evals/run.py; fi

check: detect lint type test build
	@echo "make check: OK"

# Runs setup + check on a clean copy of the last commit. Catches files that were never committed.
ci:
	@d=$$(mktemp -d); \
	git clone -q . "$$d" && $(MAKE) -C "$$d" setup check; s=$$?; \
	rm -rf "$$d"; exit $$s
