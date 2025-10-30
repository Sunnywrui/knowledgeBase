import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ParamRow {
  id: number;
  key: string;
  value: string;
}

@Component({
  selector: 'app-prompt-params',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="params-container" [class.disabled]="disabled()">
  <div class="params-header">
    <span>搜索参数</span>
    <button class="btn-add" (click)="addRow()">+ 添加</button>
  </div>
  
  <div class="params-table">
    <div class="table-header">
      <div>参数名 (Key)</div>
      <div>参数值 (Value)</div>
      <div></div>
    </div>
    
    <div class="table-body">
      <div class="table-row" *ngFor="let row of rows(); trackBy: trackById">
        <input 
          type="text" 
          [(ngModel)]="row.key"
          (ngModelChange)="onInputChange(row)"
          placeholder="例如: temperature"
          class="input-key"
        />
        <input 
          type="text" 
          [(ngModel)]="row.value"
          (ngModelChange)="onInputChange(row)"
          placeholder="例如: 0.7"
          class="input-value"
        />
        <button class="btn-remove" (click)="removeRow(row.id)">×</button>
      </div>
    </div>
  </div>

  <div class="params-actions">
    <button class="btn-clear" (click)="clearAll()">清空</button>
  </div>
</div>
  `,
styles: [`
  .params-container {
    background: var(--panel);
    border-top: 1px solid var(--border);
    padding: 16px;
  }

  .params-container.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .params-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .params-header span {
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
  }

  .btn-add {
    padding: 6px 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: var(--shadow);
  }

  .btn-add:hover {
    background: var(--accent-strong);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,.1);
  }

  .params-table {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    background: white;
    box-shadow: var(--shadow);
  }

  .table-header {
    display: grid;
    grid-template-columns: 1fr 1fr 40px;
    gap: 1px;
    padding: 12px;
    background: var(--accent-weak);
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .table-body {
    border: 1px solid #dcdcdc;
    border-radius: 4px;
    padding: 4px 8px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    max-height: 240px;
    overflow-y: auto;
  }

  .table-body input:hover,
  .table-body input:focus {
    border-color: #bfbfbf;
    box-shadow: 0 0 2px rgba(0,0,0,0.1);
  }

  .table-row {
    display: grid;
    grid-template-columns: 1fr 1fr 40px;
    gap: 1px;
    background: var(--border);
  }

  /* header 和 body 中的 input 边框统一风格 */
.table-header input,
.table-body input {
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  padding: 4px 8px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
}

.table-header input:hover,
.table-header input:focus,
.table-body input:hover,
.table-body input:focus {
  border-color: #bfbfbf;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.08);
}

/* 表头与表体列之间的分割线 */
.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 40px; /* 示例，请与你的列结构一致 */
  border-bottom: 1px solid #e0e0e0; /* header底部分割线 */
}

.table-header > div:not(:last-child),
.table-body > .table-row > div:not(:last-child) {
  border-right: 1px solid #f0f0f0; /* 列之间的分割线 */
}

/* 让整体表格更有“卡片感” */
.table-body, .table-header {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-radius: 4px;
}

  .input-key,
  .input-value {
    padding: 10px 12px;
    border: none;
    font-size: 13px;
    background: white;
    color: var(--text);
    transition: background 0.2s;
  }

  .input-key:focus,
  .input-value:focus {
    outline: none;
    background: var(--accent-weak);
  }

  .input-key::placeholder,
  .input-value::placeholder {
    color: var(--muted);
    opacity: 0.6;
  }

  .btn-remove {
    background: white;
    border: none;
    cursor: pointer;
    color: var(--muted);
    font-size: 20px;
    line-height: 1;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-remove:hover {
    background: #fee;
    color: #c33;
  }

  .params-actions {
    margin-top: 12px;
  }

  .btn-clear {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    background: white;
    color: var(--text);
    transition: all 0.2s;
  }

  .btn-clear:hover {
    background: var(--sidebar-btn-hover);
    border-color: var(--accent);
  }

  /* 滚动条样式 */
  .table-body::-webkit-scrollbar {
    width: 6px;
  }

  .table-body::-webkit-scrollbar-track {
    background: var(--bg);
  }

  .table-body::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }

  .table-body::-webkit-scrollbar-thumb:hover {
    background: var(--muted);
  }
`]
})
export class PromptParamsComponent {
  private nextId = 1;
  rows = signal<ParamRow[]>([{ id: this.nextId++, key: '', value: '' }]);
  disabled = signal(true);

  addRow() {
    this.rows.update(r => [...r, { id: this.nextId++, key: '', value: '' }]);
  }

  removeRow(id: number) {
    this.rows.update(r => r.filter(row => row.id !== id));
    if (this.rows().length === 0) {
      this.addRow();
    }
  }

  clearAll() {
    this.rows.set([{ id: this.nextId++, key: '', value: '' }]);
  }

  onInputChange(row: ParamRow) {
    const rows = this.rows();
    const lastRow = rows[rows.length - 1];
    if (lastRow.key.trim() || lastRow.value.trim()) {
      this.addRow();
    }
  }

  setDisabled(val: boolean) {
    console.log('设置参数区域状态:', val ? 'disabled' : 'enabled');
    this.disabled.set(val);
  }

  getParams(): Array<{key: string, value: string}> {
    return this.rows()
      .filter(r => r.key.trim() && r.value.trim())
      .map(r => ({ key: r.key.trim(), value: r.value.trim() }));
  }

  trackById(index: number, row: ParamRow) {
    return row.id;
  }
}