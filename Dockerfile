FROM node:24-bookworm-slim@sha256:e8e2e91b1378f83c5b2dd15f0247f34110e2fe895f6ca7719dbb780f929368eb

WORKDIR /workspace

# Keep npm output quieter in CI/container usage.
ENV npm_config_fund=false \
    npm_config_audit=false

CMD ["bash"]
