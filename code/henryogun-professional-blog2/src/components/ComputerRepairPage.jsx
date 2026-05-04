import { Wrench, Monitor, Wifi, HardDrive, Shield, Settings } from 'lucide-react';

const services = [
  {
    icon: Monitor,
    title: 'Hardware Diagnosis & Repair',
    description: 'Full hardware fault diagnosis across desktops, laptops and workstations. From failed components to motherboard faults, Henry identifies the root cause and resolves it.',
    tags: ['Desktops', 'Laptops', 'Workstations'],
  },
  {
    icon: Settings,
    title: 'System Setup & Configuration',
    description: 'Complete system builds, OS installations, driver configuration and software deployment. Stations and offices set up right from day one.',
    tags: ['Windows', 'Linux', 'OS Installation'],
  },
  {
    icon: Wifi,
    title: 'Networking & Connectivity',
    description: 'LAN/WAN setup, router configuration, network troubleshooting and structured cabling. Reliable connectivity for broadcast studios and office environments.',
    tags: ['LAN', 'WAN', 'Routers', 'Cabling'],
  },
  {
    icon: HardDrive,
    title: 'Data Recovery & Storage',
    description: 'Recovery of data from failing drives, RAID arrays and corrupted media. Backup solutions designed for broadcast and media production environments.',
    tags: ['Data Recovery', 'RAID', 'Backups'],
  },
  {
    icon: Shield,
    title: 'Security & Maintenance',
    description: 'Antivirus deployment, system hardening, scheduled maintenance and performance optimisation. Keeping broadcast and IT systems running cleanly under pressure.',
    tags: ['Antivirus', 'Hardening', 'Optimisation'],
  },
  {
    icon: Wrench,
    title: 'Broadcast IT Infrastructure',
    description: 'IT support tailored to broadcast environments, including playout systems, audio workstations and studio networks. Henry has maintained these systems across multiple stations for over 15 years.',
    tags: ['Playout Systems', 'Studio Networks', 'Broadcast IT'],
  },
];

export default function ComputerRepairPage() {
  return (
    <section className="relative py-24 min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: 'url(/h7.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(3px)',
        }}
      />
      <div className="absolute inset-0 bg-white/90" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[#f4b940] text-xs font-bold uppercase tracking-[0.25em] mb-3">Hardware, networks, and IT systems support</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Computer Repair & Maintenance</h1>
          <div className="w-20 h-1 bg-[#f4b940] mx-auto mb-6" />
          <p className="text-gray-700 text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
            Over 15 years of hands-on IT support across broadcast stations and office environments. Henry Ogun brings the same engineering precision to computer systems that he brings to broadcast infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ icon: Icon, title, description, tags }) => (
            <div
              key={title}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-[0_20px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_25px_30px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#f4b940] rounded-lg flex items-center justify-center mb-5">
                <Icon size={22} className="text-black" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
              <div className="w-16 h-0.5 bg-[#f4b940] mb-4" />
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{description}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
