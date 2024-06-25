FROM jetpackio/devbox:latest

# Installing your devbox project
WORKDIR /code
USER root:root
RUN mkdir -p /code && chown ${DEVBOX_USER}:${DEVBOX_USER} /code
USER ${DEVBOX_USER}:${DEVBOX_USER}
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} devbox.json devbox.json
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} devbox.lock devbox.lock
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} cli/setup-rust.sh cli/setup-rust.sh
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} Cargo.toml Cargo.toml
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} package.json package.json
COPY --chown=${DEVBOX_USER}:${DEVBOX_USER} pnpm-lock.yaml pnpm-lock.yaml



RUN devbox run -- echo "Installed Packages."

RUN devbox shellenv --init-hook >> ~/.profile
