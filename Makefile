.PHONY: init install db-migrate prisma-generate dev build start lint test deploy deploy-prod clean

init: install db-migrate prisma-generate ## Initialize the project (install deps, setup DB, generate Prisma)

install: ## Install dependencies
	npm install

db-migrate: ## Run database migrations
	npx prisma migrate deploy

prisma-generate: ## Generate Prisma client
	npx prisma generate

# 개발 서버
dev:
	npm run dev

# 빌드
build:
	npm run build

# 프로덕션 서버 (빌드 후 실행)
start: build
	npm run start

# 코드 검사
lint:
	npm run lint

# 테스트
test:
	npm run test

# 배포 (Preview)
deploy:
	npx vercel

# 배포 (Production)
deploy-prod:
	npx vercel --prod

# node_modules 및 빌드 결과물 삭제
clean:
	rm -rf node_modules .next
