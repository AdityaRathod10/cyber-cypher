import InvestorSearch from '@/components/InvestorSearch';
import Navbar from '@/components/navbar';

export default function Home() {
  return (
    <main>
        <div className="min-h-screen bg-gray-900 text-white">
        <Navbar/>
        <div>
        <InvestorSearch />
        </div>
        </div>
    
    </main>
  );
}