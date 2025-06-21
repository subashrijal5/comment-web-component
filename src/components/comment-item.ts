import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './reaction-panel';
import './reply-item';
import type { ReplyData } from '../api/types';
import type { CommentData } from '../api/types';


/**
 * Component for a single comment with reactions and replies
 */
@customElement('comment-item')
export class CommentItem extends LitElement {
  @property({ type: Object })
  comment: CommentData = {
    id: '',
    body: '',
    name: '',
    timestamp: '',
    replies: [],
    reaction_counts: {}
  };

  @state()
  private _replyText = '';
  
  @state()
  private _showReplyInput = false;

  render() {
    return html`
      <div class="comment-container">
        <div class="comment-header">
          <span class="author">${this.comment.name}</span>
          <span class="timestamp">${this.comment.timestamp}</span>
        </div>
        <div class="comment-content">${this.comment.body}</div>
        <div class="comment-actions">
          <reaction-panel
            @reaction-changed=${this._handleReactionChange}
            .reactionCounts=${this.comment.reaction_counts || {}}
          ></reaction-panel>
          <button 
            class="reply-button" 
            @click=${this._toggleReplyInput}
          >
            Reply
          </button>
        </div>
        
        ${this._showReplyInput ? html`
          <div class="reply-input-container">
            <textarea 
              class="reply-input"
              placeholder="Write a reply..."
              .value=${this._replyText}
              @input=${this._handleReplyInput}
            ></textarea>
            <div class="reply-input-actions">
              <button 
                class="cancel-button"
                @click=${this._toggleReplyInput}
              >
                Cancel
              </button>
              <button 
                class="submit-button"
                ?disabled=${!this._replyText.trim()}
                @click=${this._submitReply}
              >
                Reply
              </button>
            </div>
          </div>
        ` : ''}
        
        ${this.comment.replies.length > 0 ? html`
          <div class="replies-container">
            ${this.comment.replies.map(reply => html`
              <reply-item 
                .reply=${reply}
              ></reply-item>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  private _handleReactionChange(e: CustomEvent) {
    // Handle reaction changes
    this.dispatchEvent(new CustomEvent('comment-reaction-changed', {
      detail: {
        commentId: this.comment.id,
        ...e.detail
      },
      bubbles: true,
      composed: true
    }));
  }
  
  
  private _toggleReplyInput() {
    this._showReplyInput = !this._showReplyInput;
    if (!this._showReplyInput) {
      this._replyText = '';
    }
  }
  
  private _handleReplyInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this._replyText = target.value;
  }
  
  private _submitReply() {
    if (!this._replyText.trim()) return;
    
    // Create a new reply
    const newReply: ReplyData = {
      id: `reply-${Date.now()}`,
      name: 'Current User', // In a real app, this would come from auth
      body: this._replyText,
      timestamp: new Date().toLocaleString(),
      reaction_counts: {}
    };
    
    // Dispatch event for parent to handle
    this.dispatchEvent(new CustomEvent('reply-added', {
      detail: {
        commentId: this.comment.id,
        reply: newReply
      },
      bubbles: true,
      composed: true
    }));
    
    // Reset the input
    this._replyText = '';
    this._showReplyInput = false;
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: 16px;
    }
    
    .comment-container {
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      background-color: #fff;
    }
    
    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    
    .author {
      font-weight: 600;
    }
    
    .timestamp {
      color: #666;
    }
    
    .comment-content {
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    .comment-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .reply-button {
      background: transparent;
      border: none;
      color: #646cff;
      cursor: pointer;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .reply-button:hover {
      background: rgba(100, 108, 255, 0.1);
    }
    
    .reply-input-container {
      margin-bottom: 16px;
    }
    
    .reply-input {
      width: 100%;
      min-height: 80px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      margin-bottom: 8px;
      font-family: inherit;
      resize: vertical;
    }
    
    .reply-input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    .cancel-button, .submit-button {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .cancel-button {
      background: transparent;
      border: 1px solid #e0e0e0;
    }
    
    .submit-button {
      background: #646cff;
      border: 1px solid #646cff;
      color: white;
    }
    
    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .replies-container {
      margin-top: 16px;
      padding-left: 16px;
      border-left: 2px solid #e0e0e0;
    }
    
    @media (prefers-color-scheme: dark) {
      .comment-container {
        background-color: #1a1a1a;
        border-color: #444;
      }
      
      .timestamp {
        color: #aaa;
      }
      
      .reply-input {
        background-color: #2a2a2a;
        border-color: #444;
        color: rgba(255, 255, 255, 0.87);
      }
      
      .cancel-button {
        border-color: #444;
        color: rgba(255, 255, 255, 0.87);
      }
      
      .replies-container {
        border-left-color: #444;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'comment-item': CommentItem;
  }
}
