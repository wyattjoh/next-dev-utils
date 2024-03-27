# next-dev-utils

```bash
# Clone the repository.
git clone git@github.com:wyattjoh/next-dev-utils.git
cd next-dev-utils

# Install dependencies and build the source.
pnpm install
pnpm build
```

If you're using fnm, you can execute this using the same version of node each
time by aliasing it as follows in your `.bashrc` or `.zshrc` file:

```bash
alias nu='fnm exec --using=v20 node ~/path-to-the-project/next-dev-utils/packages/cli/dist/cli.js'
```

Or select any Node.js version you'd like.
