import React, { useState } from "react";
import { Member, Language, LANGUAGES } from "../types";
import { Plus, Trash2, Key, Users, Shield, RefreshCw, Layers, Check, Crown } from "lucide-react";

interface AdminViewProps {
  language: Language;
}

export default function AdminView({ language }: AdminViewProps) {
  const strings = LANGUAGES[language];
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Initialize interactive state members list
  const [members, setMembers] = useState<Member[]>([
    { id: "U-112", name: "Dr. Alexander Sterling", email: "alex.s@alexandria.ai", initials: "AS", role: "ADMIN", permissionLevel: "L1_FULL_ACCESS", lastSeen: "Active 2 min ago" },
    { id: "U-114", name: "Prof. Clara Dupont", email: "clara.dupont@sorbonne.cloud", initials: "CD", role: "EDITOR", permissionLevel: "L3_DEPT_MANAGED", lastSeen: "Active 4 hours ago" },
    { id: "U-117", name: "Dev Team System Bot", email: "bot-pipeline@alexandria.ai", initials: "SB", role: "VIEWER", permissionLevel: "L5_READ_ONLY", lastSeen: "Active" },
    { id: "U-118", name: "Dr. Ji-Sub Kim", email: "js.kim@snu.academia", initials: "JK", role: "EDITOR", permissionLevel: "L3_DEPT_MANAGED", lastSeen: "2 days ago" }
  ]);

  // Node Permission configuration state checks
  const [strictHierarchy, setStrictHierarchy] = useState(true);
  const [encryptionVault, setEncryptionVault] = useState(true);
  const [externalAccess, setExternalAccess] = useState(false);

  // Add Member form simple state modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Member["role"]>("EDITOR");
  const [newMemberLevel, setNewMemberLevel] = useState<Member["permissionLevel"]>("L3_DEPT_MANAGED");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const newId = `U-${Date.now().toString().slice(-3)}`;
    const initials = newMemberName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "TM";

    const newMember: Member = {
      id: newId,
      name: newMemberName,
      email: newMemberEmail,
      initials,
      role: newMemberRole,
      permissionLevel: newMemberLevel,
      lastSeen: "Just invited"
    };

    setMembers([...members, newMember]);
    setNewMemberName("");
    setNewMemberEmail("");
    setShowAddModal(false);
    triggerToast(`Invited ${newMember.name}`);
  };

  const handleDeleteMember = (id: string, name: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    triggerToast(`Removed member ${name}`);
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-24 right-8 z-50 px-4 py-3 bg-success text-on-success text-xs font-mono font-bold rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Admin descriptive */}
      <div className="pb-6 border-b border-outline-variant/10">
        <h2 className="text-xs font-bold font-mono tracking-widest text-[#9ea0a7]/60 uppercase mb-1">{strings.sysAdmin}</h2>
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">{language === "en" ? "System Control Plane" : "全局系统运维平面"}</h1>
        <p className="text-xs font-mono text-[#9ea0a7]/75 tracking-wider uppercase leading-relaxed max-w-4xl">{strings.adminDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Directory Column */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-on-surface font-headline uppercase tracking-wide">{strings.userDirectory}</h3>
              <p className="text-[10px] text-outline uppercase font-mono leading-none mt-1">{strings.userDirectorySub}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded">
                {strings.totalUsers}: {members.length}
              </span>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-lg text-xs leading-none transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{strings.addMember}</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/15 font-mono text-[10px] text-outline uppercase tracking-wider">
                  <th className="pb-3 weights-normal">{strings.thUser}</th>
                  <th className="pb-3 weights-normal">{strings.thRole}</th>
                  <th className="pb-3 weights-normal">{strings.thPermission}</th>
                  <th className="pb-3 weights-normal">{strings.thLastActive}</th>
                  <th className="pb-3 weights-normal text-right">{strings.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-3.5 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center font-bold font-mono text-primary text-xs">
                          {m.initials}
                        </div>
                        <div>
                          <h4 className="font-semibold text-on-surface line-clamp-1">{m.name}</h4>
                          <span className="text-[10px] text-outline font-mono">{m.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        m.role === "ADMIN" 
                          ? "bg-rose-500/10 border-rose-500/25 text-rose-500" 
                          : m.role === "EDITOR" 
                          ? "bg-primary/10 border-primary/25 text-primary" 
                          : "bg-outline-variant/20 border-outline-variant text-outline"
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 font-mono text-[9px] font-semibold text-on-surface-variant">
                      {m.permissionLevel}
                    </td>
                    <td className="py-3.5 pr-2 text-outline text-[10px] font-mono">
                      {m.lastSeen}
                    </td>
                    <td className="py-3.5 text-right">
                      {m.id !== "U-112" ? (
                        <button 
                          onClick={() => handleDeleteMember(m.id, m.name)}
                          className="p-1 px-1.5 rounded bg-surface border border-outline-variant/20 hover:border-error hover:text-error text-[10px] font-mono uppercase text-outline font-bold transition-all"
                        >
                          DELETE
                        </button>
                      ) : (
                        <span className="text-[9px] font-mono uppercase text-outline block leading-none pr-3">YOU</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permission Topology & Settings column */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/15 shadow-sm space-y-4">
            <div className="border-b border-outline-variant/10 pb-3">
              <h3 className="text-sm font-semibold text-on-surface font-headline uppercase tracking-wide">{strings.permTopology}</h3>
            </div>

            <div className="space-y-4">
              {/* Checklist 01 */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-outline-variant/15 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={strictHierarchy}
                  onChange={(e) => {
                    setStrictHierarchy(e.target.checked);
                    triggerToast(`Strict Hierarchy: ${e.target.checked ? "ENABLED" : "DISABLED"}`);
                  }}
                  className="rounded text-primary border-outline-variant/30 focus:ring-primary w-4.5 h-4.5 mt-0.5"
                />
                <div>
                  <h4 className="text-xs font-semibold text-on-surface">{strings.strictHierarchy}</h4>
                  <p className="text-[10px] text-outline mt-0.5 leading-snug">{strings.strictHierarchyDesc}</p>
                </div>
              </label>

              {/* Checklist 02 */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-outline-variant/15 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={encryptionVault}
                  onChange={(e) => {
                    setEncryptionVault(e.target.checked);
                    triggerToast(`Encryption Vault: ${e.target.checked ? "ROTATED ON" : "PAUSED"}`);
                  }}
                  className="rounded text-primary border-outline-variant/30 focus:ring-primary w-4.5 h-4.5 mt-0.5"
                />
                <div>
                  <h4 className="text-xs font-semibold text-on-surface">{strings.encryptionVault}</h4>
                  <p className="text-[10px] text-outline mt-0.5 leading-snug">{strings.encryptionVaultDesc}</p>
                </div>
              </label>

              {/* Checklist 03 */}
              <label className="flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-outline-variant/15 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={externalAccess}
                  onChange={(e) => {
                    setExternalAccess(e.target.checked);
                    triggerToast(`External Access: ${e.target.checked ? "AUTHORIZED" : "REVOKED"}`);
                  }}
                  className="rounded text-primary border-outline-variant/30 focus:ring-primary w-4.5 h-4.5 mt-0.5"
                />
                <div>
                  <h4 className="text-xs font-semibold text-on-surface">{strings.externalAccess}</h4>
                  <p className="text-[10px] text-outline mt-0.5 leading-snug">{strings.externalAccessDesc}</p>
                </div>
              </label>
            </div>
          </div>

          {/* Luxury Enterprise Upgrade card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary-fixed-dim/40 via-surface-container-high to-surface-container-lowest border border-primary/25 shadow-md relative overflow-hidden flex flex-col justify-between">
            {/* Crown decoration icon overlay watermark */}
            <div className="absolute top-2 right-2 opacity-[0.06] text-primary rotate-12 max-w-sm">
              <Crown className="w-24 h-24" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/35 px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider font-bold text-amber-500 text-xs">
                PRO ACTIVE
              </div>
              <h4 className="text-sm font-bold font-headline text-on-surface">
                {strings.upgradeProTitle}
              </h4>
              <p className="text-[11px] text-on-surface-variant font-light leading-relaxed">
                {strings.upgradeProDesc}
              </p>
            </div>

            <div className="pt-4 relative z-10">
              <button 
                onClick={() => triggerToast(language === "en" ? "Proceeding to system upgrade billing..." : "正在前往全局企业级升级订单中心...")}
                className="w-full py-2.5 bg-primary text-on-primary hover:bg-primary-hover font-semibold rounded-lg text-xs leading-none shadow transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{strings.upgradeLicenseBtn}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Add Member Invitation Modal details */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-base text-on-surface uppercase tracking-wide">Invite Workspace Partner</h3>
              <button onClick={() => setShowAddModal(false)} className="text-outline hover:text-on-surface text-xl leading-none font-bold">×</button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-outline mb-1.5" htmlFor="partner_name">Full Name</label>
                <input
                  type="text"
                  id="partner_name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface text-on-surface border border-outline-variant/30 rounded focus:outline-none focus:border-primary"
                  placeholder="e.g. Jean-Luc Picard"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-outline mb-1.5" htmlFor="partner_email">Orchestrator Email</label>
                <input
                  type="email"
                  id="partner_email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface text-on-surface border border-outline-variant/30 rounded focus:outline-none focus:border-primary"
                  placeholder="e.g. picard@starfleet.academy"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-outline mb-1.5">Access Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-2 py-2 bg-surface text-on-surface border border-outline-variant/30 rounded focus:outline-none focus:border-primary"
                  >
                    <option value="EDITOR">EDITOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-outline mb-1.5">Clearance Level</label>
                  <select
                    value={newMemberLevel}
                    onChange={(e) => setNewMemberLevel(e.target.value as any)}
                    className="w-full px-2 py-2 bg-surface text-on-surface border border-outline-variant/30 rounded focus:outline-none focus:border-primary"
                  >
                    <option value="L3_DEPT_MANAGED">L3_DEPT_MANAGED</option>
                    <option value="L1_FULL_ACCESS">L1_FULL_ACCESS</option>
                    <option value="L5_READ_ONLY">L5_READ_ONLY</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-container-high border border-outline-variant/30 font-semibold rounded-lg text-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-lg shadow"
                >
                  Dispatch Invitation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
