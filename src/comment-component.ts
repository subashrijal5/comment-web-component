import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Blog } from "./api/types";

// Import our components
import "./components/main-content";
import "./components/comment-thread";
import {
  addComment,
  authenticate,
  toggleReaction,
  verifyBlog,
} from "./api/verify-blog";

/**
 * Main comment system component that integrates all sub-components
 *
 * @slot - Content to be displayed in the main content area
 */
@customElement("comment-component")
export class CommentComponent extends LitElement {
  @property({ type: String })
  title = "Example Post Title";

  @state()
  private _token = "";

  @state()
  private _siteId = "";

  @state()
  private _blog: Blog | null = null;

  @property({ type: String })
  author = "John Doe";

  @property({ type: String })
  url = "";

  @property({ type: String })
  timestamp = new Date().toLocaleString();

  @property({ type: String })
  content = "";

  protected async firstUpdated(
    _changedProperties: PropertyValues
  ): Promise<void> {
    const authResponse = await authenticate();
    this._token = authResponse.token;
    this._siteId = authResponse.site.id;
    const blogResponse = await verifyBlog({
      url: this.url,
      token: this._token,
      siteId: this._siteId,
    });
    this._blog = blogResponse.blog;

  }


  render() {
    return html`
      <div class="comment-system-container">
        <main-content
          .title=${this.title}
          .author=${this.author}
          .timestamp=${this.timestamp}
          .content=${this.content}
          .reactionCounts=${this._blog?.reaction_counts || {}}
          @content-reaction-changed=${this._handleContentReactionChange}
        >
          <slot></slot>
        </main-content>

        <comment-thread
          .token=${this._token}
          .siteId=${this._siteId}
          .blog=${this._blog}
          @comment-added=${this._handleCommentAdded}
          @comment-reaction-changed=${this._handleCommentReactionChange}
          @reply-added=${this._handleReplyAdded}
          @reply-reaction-changed=${this._handleReplyReactionChange}
        ></comment-thread>
      </div>
    `;
  }

  private async _handleContentReactionChange(e: CustomEvent) {
    console.log("Content reaction changed:", e.detail);
    if (!this._blog?.id) return;
    await toggleReaction({
      blogId: this._blog.id,
      token: this._token,
      reaction: e.detail.reaction,
    });
  }

  private async _handleCommentAdded(e: CustomEvent) {
    await addComment({
      siteId: this._siteId,
      token: this._token,
      comment: e.detail.comment,
    });
  }

  private _handleCommentReactionChange(e: CustomEvent) {
    console.log("Comment reaction changed:", e.detail);
    // In a real app, you would update state or send to a backend
  }

  private async _handleReplyAdded(e: CustomEvent) {
    console.log("Reply added:", e.detail);
    await addComment({
      siteId: this._siteId,
      token: this._token,
      comment: e.detail.reply,
      parentId: e.detail.commentId,
    });
  }

  private async _handleReplyReactionChange(e: CustomEvent) {
    console.log("Reply reaction changed:", e.detail);
  }

  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
        sans-serif;
    }

    .comment-system-container {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "comment-component": CommentComponent;
  }
}
