import { createAppState } from './app/state.js';
import { loadRecords } from './storage/records-storage.js';
import { mountApp } from './ui/app.js';
const root = document.createElement('div');
root.id = 'app';
document.body.append(root);
mountApp(root, createAppState(loadRecords()));
//# sourceMappingURL=main.js.map