export default function HowItWorksSection() {
  const steps = [
    {
      id: "01",
      title: "Discover & Fund",
      description: "Explore curated, early-stage campaigns and back projects directly with your BNB.",
      icon: "🔍"
    },
    {
      id: "02",
      title: "Milestone Escrow",
      description: "Funds are locked in a secure smart contract escrow and released only when milestones are met.",
      icon: "🔒"
    },
    {
      id: "03",
      title: "Engage & Validate",
      description: "Track progress, engage with founders, and participate in community validation to shape the future.",
      icon: "🤝"
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#111111] text-[#FCFAF6]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-black font-mono tracking-tighter uppercase mb-4">
            How Evolis Works
          </h2>
          <p className="text-xl text-[#FCFAF6]/70 font-sans max-w-2xl">
            A transparent and milestone-driven approach to funding the next generation of web3 startups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="bg-[#1a1a1a] border border-[#333] rounded-[2rem] p-8 hover:border-accent transition-colors duration-300 flex flex-col"
            >
              <div className="text-4xl mb-6">{step.icon}</div>
              <div className="text-accent font-mono font-bold text-sm mb-4">STEP {step.id}</div>
              <h3 className="text-2xl font-black font-mono tracking-tight uppercase mb-4">{step.title}</h3>
              <p className="text-[#FCFAF6]/70 font-sans leading-relaxed flex-grow">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
