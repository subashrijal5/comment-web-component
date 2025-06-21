import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './reaction-panel';
import type { ReplyData } from '../api/types';


/**
 * Component for a single reply (no nesting under this)
 */
@customElement('reply-item')
export class ReplyItem extends LitElement {
  @property({ type: Object })
  reply: ReplyData = {
    id: '',
    name: '',
    body: '',
    timestamp: '',
    reaction_counts: {}
  };

  render() {
    return html`
      <div class="reply-container">
        <div class="reply-header">
          <span class="author">${this.reply.name}</span>
          <span class="timestamp">${this.reply.timestamp}</span>
        </div>
        <div class="reply-content">${this.reply.body}</div>
        <div class="reply-actions">
          <reaction-panel
            .reactionCounts=${this.reply.reaction_counts}
            @reaction-changed=${this._handleReactionChange}
          ></reaction-panel>
        </div>
      </div>
    `;
  }

  private _handleReactionChange(e: CustomEvent) {
    // Handle reaction changes
    this.dispatchEvent(new CustomEvent('reply-reaction-changed', {
      detail: {
        replyId: this.reply.id,
        ...e.detail
      },
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
    :host {
      display: block;
    }
    
    .reply-container {
      padding: 12px;
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.03);
      margin-bottom: 8px;
    }
    
    .reply-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9em;
    }
    
    .author {
      font-weight: 600;
    }
    
    .timestamp {
      color: #666;
    }
    
    .reply-content {
      margin-bottom: 12px;
      line-height: 1.5;
    }
    
    .reply-actions {
      display: flex;
      justify-content: flex-start;
    }
    
    @media (prefers-color-scheme: dark) {
      .reply-container {
        background-color: rgba(255, 255, 255, 0.05);
      }
      
      .timestamp {
        color: #aaa;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'reply-item': ReplyItem;
  }
}
