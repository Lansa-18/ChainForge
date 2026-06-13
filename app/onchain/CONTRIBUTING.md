# Contributing to On-Chain Contracts

Welcome. This document outlines how to contribute to ChainForge's on-chain contracts.

---

## Code standards

### Rust style guide

- Follow the [Rust Style Guide](https://doc.rust-lang.org/nightly/style-guide/)
- Use `cargo fmt` before committing
- No warnings allowed (`cargo clippy -- -D warnings`)

### Contract-specific standards

- **Naming:**
  - Structs: `PascalCase` (e.g., `AidEscrow`)
  - Functions: `snake_case` (e.g., `create_package`)
  - Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_PACKAGE_AMOUNT`)
- **Storage:** Use descriptive keys, avoid collisions
- **Errors:** Use custom error types, not string literals

### Documentation

```rust
/// Creates a new aid package
///
/// # Arguments
/// * `env` - The Soroban environment
/// * `operator` - Address of the admin or distributor creating the package
/// * `id` - Unique package ID
/// * `recipient` - Address of the recipient
/// * `amount` - Amount to escrow
/// * `token` - Token contract address
/// * `expires_at` - Expiration timestamp (0 for no expiration)
///
/// # Returns
/// * `Result<u64, Error>` - Package ID on success
///
/// # Errors
/// Returns `Error::InvalidAmount` if amount is zero or negative
/// Returns `Error::PackageIdExists` if ID already exists
/// Returns `Error::InsufficientFunds` if contract lacks sufficient balance
pub fn create_package(
    env: Env,
    operator: Address,
    id: u64,
    recipient: Address,
    amount: i128,
    token: Address,
    expires_at: u64,
) -> Result<u64, Error> {
    // implementation
}
```

---

## CI/CD and testing

We enforce strict quality gates. Before submitting a PR, ensure you have:

1. **Formatted code:** `cargo fmt --check` must pass.
2. **No Clippy warnings:** `cargo clippy -- -D warnings` must pass.
3. **Tests pass:** `cargo test` must pass (unit and integration).

---

## PR checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with `cargo test`

---

## See also

- [Module README](./README.md) — Contract methods, events, and deployment
- [Deployment runbook](../../docs/testnet-deploy-runbook.md)
