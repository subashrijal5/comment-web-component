import { LitElement, html, css, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./comment-item";
import type { CommentData, Blog, Pagination, Reaction } from "../api/types";
import { getComments } from "../api/verify-blog";

/**
 * Component for managing a list of top-level comments
 */
@customElement("comment-thread")
export class CommentThread extends LitElement {
  @state()
  comments: CommentData[] = [];

  @state()
  pagination: Pagination | null = null;

  @property({ type: Object })
  blog: Blog | null = null;

  @property({ type: String })
  token = "";

  @property({ type: String })
  siteId = "";

  protected async firstUpdated(
    _changedProperties: PropertyValues
  ): Promise<void> {
    this._commentName = localStorage.getItem("commentName") || "";
  }

  protected async updated(_changedProperties: PropertyValues): Promise<void> {
    if (!this.token || !this.siteId) {
      console.error("Missing token or siteId");
      return;
    }
    if (_changedProperties.has("blog")) {
      await getComments({ siteId: this.siteId, token: this.token }).then(
        (data) => {
          this.comments = data.comments;
          this.pagination = data.pagination;
        }
      );
    }
  }

  private async _handleLoadMoreComments() {
    if (!this.pagination) return;
    const page = this.pagination.current_page + 1;
    const commentsResponse = await getComments({
      siteId: this.siteId,
      token: this.token,
      page,
    });
    this.comments = [...this.comments, ...commentsResponse.comments];
    this.pagination = commentsResponse.pagination;
  }

  @state()
  private _commentText = "";

  @state()
  private _commentName = "";

  render() {
    return html`
      <div class="comment-thread-container">
        <div class="comment-input-container">
          <h3>Add a comment</h3>
          <input
            type="text"
            class="comment-name-input"
            placeholder="Name"
            .value=${this._commentName}
            @input=${this._handleCommentNameInput}
          />
          <textarea
            class="comment-input"
            placeholder="Write a comment..."
            .value=${this._commentText}
            @input=${this._handleCommentInput}
          ></textarea>
          <div class="comment-input-actions">
            <button
              class="submit-button"
              ?disabled=${!this._commentText.trim()}
              @click=${this._submitComment}
            >
              Comment
            </button>
          </div>
        </div>

        <div class="comments-list">
          ${this.comments.length > 0
            ? this.comments.map(
                (comment) => html`
                  <comment-item
                    .comment=${comment}
                    @reply-added=${this._handleReplyAdded}
                  ></comment-item>
                `
              )
            : html`<p class="no-comments">
                No comments yet. Be the first to comment!
              </p>`}
        </div>
        <div class="pagination">
          ${this.pagination?.has_more
            ? html`
                <button
                  class="load-more-button"
                  @click=${() => this._handleLoadMoreComments()}
                >
                  Load More
                </button>
              `
            : null}
        </div>
      </div>
    `;
  }

  private _handleCommentInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this._commentText = target.value;
  }

  private _commentNameTimeout: any;

  private _handleCommentNameInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this._commentName = target.value;
    // Debounce the localStorage update
    clearTimeout(this._commentNameTimeout);
    this._commentNameTimeout = setTimeout(() => {
      localStorage.setItem("commentName", target.value);
    }, 500);
  }

  private _submitComment() {
    if (!this._commentText.trim()) return;

    // Create a new comment
    const newComment: CommentData = {
      id: `comment-${Date.now()}`,
      body: this._commentText,
      timestamp: new Date().toLocaleString(),
      name: this._commentName,
      replies: [],
      reaction_counts: {},
    };

    // Update the comments array
    this.comments = [newComment, ...this.comments];

    // Dispatch event for parent to handle
    this.dispatchEvent(
      new CustomEvent("comment-added", {
        detail: {
          comment: newComment,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Reset the input
    this._commentText = "";
    this._commentName = "";
  }

  private _handleReplyAdded(e: CustomEvent) {
    const { commentId, reply } = e.detail;

    // Find the comment and add the reply
    const updatedComments = this.comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [reply, ...comment.replies],
        };
      }
      return comment;
    });

    this.comments = updatedComments;
  }

  static styles = css`
    :host {
      display: block;
    }

    .comment-thread-container {
      width: 100%;
    }

    .comment-input-container {
      margin-bottom: 24px;
    }

    .comment-name-input {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      margin-bottom: 8px;
      font-family: inherit;
    }

    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 1.2em;
    }

    .comment-input {
      width: 100%;
      min-height: 100px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      margin-bottom: 8px;
      font-family: inherit;
      resize: vertical;
    }

    .comment-input-actions {
      display: flex;
      justify-content: flex-end;
    }

    .submit-button {
      padding: 8px 16px;
      border-radius: 4px;
      background: #646cff;
      border: 1px solid #646cff;
      color: white;
      font-weight: 500;
      cursor: pointer;
    }

    .pagination {
      display: flex;
      justify-content: center;
    }

    .load-more-button {
      padding: 8px 16px;
      margin: 0 auto;
      border-radius: 4px;
      background: #5c5fa4;
      border: 1px solid #5c5fa4;
      color: white;
      font-weight: 500;
      cursor: pointer;
    }

    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .comments-list {
      margin-top: 24px;
    }

    .no-comments {
      text-align: center;
      color: #666;
      font-style: italic;
    }

    @media (prefers-color-scheme: dark) {
      .comment-input {
        background-color: #2a2a2a;
        border-color: #444;
        color: rgba(255, 255, 255, 0.87);
      }

      .no-comments {
        color: #aaa;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "comment-thread": CommentThread;
  }
}
