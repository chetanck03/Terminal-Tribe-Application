import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ChatBot from '../ChatBot';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-campus-lightPurple/30 pt-16">
      <Navbar />
      <div className="flex flex-1">
        <div className="hidden md:block fixed h-[calc(100vh-4rem)] top-16 left-0 w-64 z-10">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto md:ml-64">
          <div className="frost-card p-6 min-h-[calc(100vh-6rem)]">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
      <ChatBot configUrl="https://files.bpcontent.cloud/2025/04/10/10/20250410104555-7B33LUMD.json" />
    </div>
  );
};

export default AppLayout;
