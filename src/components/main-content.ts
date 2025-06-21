import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './reaction-panel';
import type { Reaction, ReactionType } from '../api/types';

/**
 * Component for displaying the main content with reactions
 */
@customElement('main-content')
export class MainContent extends LitElement {
  @property({ type: String })
  title = '';

  @property({ type: String })
  content = '';

  @property({ type: String })
  author = '';

  @property({ type: String })
  timestamp = '';

  @property({ type: Object })
  reactionCounts: Partial<Record<ReactionType, number>> = {};


  render() {
    return html`
      <div class="main-content-container">
        <h2 class="title">${this.title}</h2>
        
        <div class="metadata">
          <span class="author">${this.author}</span>
          <span class="timestamp">${this.timestamp}</span>
        </div>
        
        <div class="content">
          <slot></slot>
          ${this.content ? html`<p>${this.content}</p>` : ''}
        </div>
        
        <div class="reactions">
          <reaction-panel
            @reaction-changed=${this._handleReactionChange}
            .reactionCounts=${this.reactionCounts}
          ></reaction-panel>
        </div>
      </div>
    `;
  }

  private _handleReactionChange(e: CustomEvent) {
    // Forward the reaction event
    this.dispatchEvent(new CustomEvent('content-reaction-changed', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
    :host {
      display: block;
      margin-bottom: 32px;
    }
    
    .main-content-container {
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      background-color: #fff;
    }
    
    .title {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 1.8em;
    }
    
    .metadata {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      font-size: 0.9em;
    }
    
    .author {
      font-weight: 600;
    }
    
    .timestamp {
      color: #666;
    }
    
    .content {
      margin-bottom: 24px;
      line-height: 1.6;
    }
    
    .reactions {
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    @media (prefers-color-scheme: dark) {
      .main-content-container {
        background-color: #1a1a1a;
        border-color: #444;
      }
      
      .timestamp {
        color: #aaa;
      }
      
      .reactions {
        border-top-color: #444;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'main-content': MainContent;
  }
}
