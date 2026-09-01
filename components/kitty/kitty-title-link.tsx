const KITTY_REPO_URL = "https://github.com/vroslmend/kitty-agent";

export function KittyTitleLink() {
  return (
    <a
      href={KITTY_REPO_URL}
      target="_blank"
      rel="noreferrer"
      className="kitty-title kitty-title-link u-link"
      aria-label="View the kitty-agent source on GitHub"
    >
      kitty.
      <span className="kitty-title-arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
