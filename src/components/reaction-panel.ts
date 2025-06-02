import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

type Reaction = {
  emoji: string;
  count: number;
  selected: boolean;
  type: "like" | "love" | "laugh" | "surprised" | "sad";
};

/**
 * Reusable component for displaying and selecting reactions
 */
@customElement("reaction-panel")
export class ReactionPanel extends LitElement {
  @property({ type: Array })
  reactions: Reaction[] = [
    { emoji: "👍", count: 0, selected: false, type: "like" },
    { emoji: "❤️", count: 0, selected: false, type: "love" },
    { emoji: "😂", count: 0, selected: false, type: "laugh" },
    { emoji: "😮", count: 0, selected: false, type: "surprised" },
    { emoji: "😢", count: 0, selected: false, type: "sad" },
  ];

  render() {
    return html`
      <div class="reaction-container">
        ${this.reactions.map(
          (reaction, index) => html`
            <button
              class="reaction-button ${reaction.selected ? "selected" : ""}"
              @click=${() => this._handleReaction(index)}
            >
              <span class="emoji">${reaction.emoji}</span>
              ${reaction.count > 0
                ? html`<span class="count">${reaction.count}</span>`
                : ""}
            </button>
          `
        )}
      </div>
    `;
  }

  private _handleReaction(index: number) {
    let updatedReactions: Reaction[] = [];
    const selectedReaction = this.reactions[index];

    this.reactions.forEach((reaction) => {
      if (reaction.type === selectedReaction.type) {
        // Toggle the selected reaction
        if (reaction.selected) {
          reaction.selected = false;
          reaction.count -= 1;
        } else {
          reaction.selected = true;
          reaction.count += 1;
        }
      } else {
        // Unselect all other reactions
        if (reaction.selected) {
          reaction.selected = false;
          reaction.count -= 1;
        }
      }

      updatedReactions.push(reaction);
    });
    this.reactions = updatedReactions;
    this.dispatchEvent(
      new CustomEvent("reaction-changed", {
        detail: {
          reaction: this.reactions[index],
          reactions: this.reactions,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = css`
    :host {
      display: block;
    }

    .reaction-container {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .reaction-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 16px;
      border: 1px solid #e0e0e0;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .reaction-button:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .reaction-button.selected {
      background: rgba(0, 0, 255, 0.1);
      border-color: rgba(0, 0, 255, 0.3);
    }

    .emoji {
      font-size: 1.2em;
    }

    .count {
      font-size: 0.9em;
      font-weight: 500;
    }

    @media (prefers-color-scheme: dark) {
      .reaction-button {
        border-color: #444;
      }

      .reaction-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .reaction-button.selected {
        background: rgba(100, 108, 255, 0.2);
        border-color: rgba(100, 108, 255, 0.5);
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "reaction-panel": ReactionPanel;
  }
}
