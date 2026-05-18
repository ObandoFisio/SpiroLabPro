/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SpirometrySimulator from './components/SpirometrySimulator';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <SpirometrySimulator />
    </div>
  );
}
