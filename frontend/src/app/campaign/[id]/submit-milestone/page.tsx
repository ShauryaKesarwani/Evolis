"use client";

import React, { useState } from "react";
import Link from "next/link";

export default async function SubmitMilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaignId = id || "123";

  // Mock: In production, check connected wallet === campaign creator
  const isOwner = true;

  // Mock milestone context
  const currentMilestone = {
    index: 3,
    description:
      "Mainnet Beta Launch. Enable live zero-knowledge profile generation for whitelisted addresses.",
    unlockAmountBNB: 1250,
  };

  const [summary, setSummary] = useState("");
  const [evidence, setEvidence] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setSubmitting(true);

    // TODO: POST to backend or store off-chain for admin review
    await new Promise((r) => setTimeout(r, 1500));

    setSubmitted(true);
    setSubmitting(false);
  };

  if (!isOwner) {
    return (
      <section className="min-h-screen bg-[#FCFAF6] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-black font-mono tracking-tighter text-[#111111] mb-4 uppercase">
            Access Denied
          </h1>
          <p className="text-[#111111]/70 font-sans mb-6">
            Only the campaign owner can submit milestone completions.
          </p>
          <Link
            href={`/campaign/${campaignId}`}
            className="px-6 py-3 rounded-full bg-[#111111] text-[#FCFAF6] font-mono font-bold text-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_#b5e315] active:translate-y-0 active:shadow-none transition-all duration-200"
          >
            ← Back to Campaign
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FCFAF6] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href={`/campaign/${campaignId}`}
          className="inline-flex items-center gap-2 text-sm font-mono text-[#111111]/50 hover:text-[#111111] transition-colors mb-8"
        >
          ← Back to Campaign
        </Link>

        <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#111111] uppercase mb-2">
          Submit Milestone
        </h1>
        <p className="text-lg text-[#111111]/70 font-sans mb-12">
          Provide proof of completion for the current milestone.
        </p>

        {/* Current Milestone Context */}
        <div className="bg-white rounded-2xl border border-[#111111]/10 p-6 mb-8">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[#b5e315] font-mono font-bold text-sm">
              MILESTONE {currentMilestone.index}
            </span>
            <span className="px-3 py-1 bg-[#FCFAF6] text-[#111111] text-xs font-bold font-mono rounded-full border border-[#111111]/10">
              Pending Submission
            </span>
          </div>
          <p className="text-[#111111] font-sans leading-relaxed mb-3">
            {currentMilestone.description}
          </p>
          <div className="text-sm font-mono text-[#111111]/50">
            Unlocks:{" "}
            <span className="font-bold text-[#111111]">
              {currentMilestone.unlockAmountBNB.toLocaleString()} BNB
            </span>
          </div>
        </div>

        {submitted ? (
          /* Post-Submission Confirmation */
          <div className="bg-[#111111] text-[#FCFAF6] rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-black font-mono tracking-tight uppercase mb-3">
              Submission Received
            </h2>
            <p className="text-[#FCFAF6]/70 font-sans mb-6">
              Your milestone completion proof has been submitted. An admin will
              review and verify it shortly.
            </p>
            <span className="inline-block px-4 py-2 bg-[#b5e315] text-[#111111] font-mono font-bold text-sm rounded-full">
              Awaiting Admin Review
            </span>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Summary */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#111111]/50 uppercase tracking-widest mb-2">
                Milestone Completion Summary *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe what was accomplished for this milestone..."
                rows={4}
                required
                className="w-full bg-white rounded-xl border border-[#111111]/10 p-4 font-sans text-[#111111] placeholder:text-[#111111]/30 focus:outline-none focus:border-[#111111]/30 focus:ring-2 focus:ring-[#b5e315]/30 transition-all resize-none"
              />
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#111111]/50 uppercase tracking-widest mb-2">
                Supporting Evidence / Notes
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Any additional context, technical notes, or evidence..."
                rows={3}
                className="w-full bg-white rounded-xl border border-[#111111]/10 p-4 font-sans text-[#111111] placeholder:text-[#111111]/30 focus:outline-none focus:border-[#111111]/30 focus:ring-2 focus:ring-[#b5e315]/30 transition-all resize-none"
              />
            </div>

            {/* Proof URL */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#111111]/50 uppercase tracking-widest mb-2">
                External Proof Link (Optional)
              </label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://github.com/your-org/repo/releases/v1.0"
                className="w-full bg-white rounded-xl border border-[#111111]/10 p-4 font-sans text-[#111111] placeholder:text-[#111111]/30 focus:outline-none focus:border-[#111111]/30 focus:ring-2 focus:ring-[#b5e315]/30 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !summary.trim()}
              className="w-full py-4 rounded-full bg-[#111111] text-[#FCFAF6] font-mono font-bold text-base border-2 border-[#111111] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#b5e315] active:translate-y-0 active:shadow-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {submitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
