import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, query, updateDoc, addDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// --- SVG Icons ---
const DocumentIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const UserGroupIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.184-1.268-.5-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.184-1.268.5-1.857m0 0a5.002 5.002 0 019 0m-4.5 4.5a5.002 5.002 0 00-9 0" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const LockOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 3a3 3 0 013 3v2H7V7a3 3 0 013-3z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const LoadingSpinner = () => <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>;
const AlertIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.37-1.21 3.006 0l5.428 10.362c.643 1.226-.206 2.788-1.503 2.788H4.332c-1.297 0-2.146-1.562-1.503-2.788L8.257 3.099zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
const PillIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 3.523a.75.75 0 00-1.5 0V6h-3a.75.75 0 000 1.5h3v2.5a.75.75 0 001.5 0V7.5h3a.75.75 0 000-1.5h-3V3.5z" /><path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 002 4.5v11A2.5 2.5 0 004.5 18h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0015.5 2h-11zM3.5 4.5a1 1 0 011-1h11a1 1 0 011 1v11a1 1 0 01-1 1h-11a1 1 0 01-1-1v-11z" clipRule="evenodd" /></svg>;
const BeakerIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.25 2.25a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5zM4.5 5.5a.5.5 0 00-.5.5v1.25a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75V6a.5.5 0 00-.5-.5H4.5zM3.75 9A.75.75 0 003 9.75v6.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0017 16.25v-6.5A.75.75 0 0016.25 9h-12.5zM4.5 10.5h11V16a.25.25 0 01-.25.25H4.75A.25.25 0 014.5 16v-5.5z" clipRule="evenodd" /></svg>;
const StethoscopeIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a5.5 5.5 0 00-5.5 5.5v1.5a.5.5 0 001 0V9a4.5 4.5 0 119 0v1.5a.5.5 0 001 0V9A5.5 5.5 0 0010 3.5z" /><path d="M3 10a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1A.5.5 0 013 10zM3 12a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1A.5.5 0 013 12zM15.5 9.5h1a.5.5 0 010 1h-1a.5.5 0 010-1zM15.5 11.5h1a.5.5 0 010 1h-1a.5.5 0 010-1z" /><path fillRule="evenodd" d="M10 18a3 3 0 100-6 3 3 0 000 6zm-2-3a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" /></svg>;
const GeminiIcon = ({ className }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.06891 11.021C6.25841 12.033 6.66691 12.961 7.25691 13.738L5.34291 15.652C4.46291 14.542 3.88241 13.181 3.67491 11.701C3.46741 10.22 3.64291 8.70703 4.18491 7.31803L6.06891 11.021Z" fill="url(#paint0_linear_1_2)"/><path d="M13.7381 7.25696C12.9611 6.66696 12.0331 6.25846 11.0211 6.06896L7.31813 4.18496C8.70713 3.64296 10.2201 3.46746 11.7011 3.67496C13.1811 3.88246 14.5421 4.46296 15.6521 5.34296L13.7381 7.25696Z" fill="url(#paint1_linear_1_2)"/><path d="M11.021 17.931C12.033 17.7415 12.961 17.333 13.738 16.743L15.652 18.657C14.542 19.537 13.181 20.1175 11.701 20.325C10.22 20.5325 8.70703 20.357 7.31803 19.815L11.021 17.931Z" fill="url(#paint2_linear_1_2)"/><path d="M16.7431 13.738C17.3331 12.961 17.7416 12.033 17.9311 11.021L19.8151 7.31803C20.3571 8.70703 20.5326 10.22 20.3251 11.701C20.1176 13.181 19.5371 14.542 18.6571 15.652L16.7431 13.738Z" fill="url(#paint3_linear_1_2)"/><defs><linearGradient id="paint0_linear_1_2" x1="4.72666" y1="7.97978" x2="6.62666" y2="14.99" gradientUnits="userSpaceOnUse"><stop stopColor="#4285F4"/><stop offset="1" stopColor="#34A853"/></linearGradient><linearGradient id="paint1_linear_1_2" x1="7.97978" y1="4.72661" x2="14.99" y2="6.62661" gradientUnits="userSpaceOnUse"><stop stopColor="#34A853"/><stop offset="1" stopColor="#F9AB00"/></linearGradient><linearGradient id="paint2_linear_1_2" x1="7.97978" y1="19.2734" x2="14.99" y2="17.3734" gradientUnits="userSpaceOnUse"><stop stopColor="#F9AB00"/><stop offset="1" stopColor="#EA4335"/></linearGradient><linearGradient id="paint3_linear_1_2" x1="19.2734" y1="16.0202" x2="17.3734" y2="9.00923" gradientUnits="userSpaceOnUse"><stop stopColor="#EA4335"/><stop offset="1" stopColor="#4285F4"/></linearGradient></defs></svg>;
const DownloadIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const TimelineIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ListIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;


// --- Firebase Configuration and Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Main App Component ---
export default function App() {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [records, setRecords] = useState([]);
    const [providers, setProviders] = useState([]);
    const [isAddRecordModalOpen, setAddRecordModalOpen] = useState(false);
    const [isAddProviderModalOpen, setAddProviderModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeView, setActiveView] = useState('list'); // 'list' or 'timeline'

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'sshr-default-app';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) { console.error("Authentication failed:", error); }
            }
            setIsAuthReady(true);
        });
        
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthReady || !userId) { setIsLoading(true); return; }
        setIsLoading(true);
        const recordsPath = `artifacts/${appId}/users/${userId}/medicalRecords`;
        const providersPath = `artifacts/${appId}/users/${userId}/healthcareProviders`;

        const recordsQuery = query(collection(db, recordsPath));
        const unsubscribeRecords = onSnapshot(recordsQuery, (snapshot) => {
            const recordsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            recordsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecords(recordsData);
            setIsLoading(false);
        }, (error) => { console.error("Error fetching records:", error); setIsLoading(false); });

        const providersQuery = query(collection(db, providersPath));
        const unsubscribeProviders = onSnapshot(providersQuery, (snapshot) => {
            setProviders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => console.error("Error fetching providers:", error));

        return () => { unsubscribeRecords(); unsubscribeProviders(); };
    }, [isAuthReady, userId, appId]);

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const typeMatch = activeFilter === 'All' || record.type === activeFilter;
            const searchMatch = searchTerm === '' ||
                record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.details.toLowerCase().includes(searchTerm.toLowerCase());
            return typeMatch && searchMatch;
        });
    }, [records, searchTerm, activeFilter]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleAddRecord = async (record) => {
        if (!userId) return;
        try {
            const recordsPath = `artifacts/${appId}/users/${userId}/medicalRecords`;
            await addDoc(collection(db, recordsPath), record);
            setAddRecordModalOpen(false);
            showNotification('Medical record added successfully!');
        } catch (error) { console.error("Error adding record:", error); showNotification('Failed to add record.', 'error'); }
    };

    const handleAddProvider = async (provider) => {
        if (!userId) return;
        try {
            const providersPath = `artifacts/${appId}/users/${userId}/healthcareProviders`;
            await addDoc(collection(db, providersPath), { ...provider, hasAccess: true });
            setAddProviderModalOpen(false);
            showNotification('Healthcare provider added!');
        } catch (error) { console.error("Error adding provider:", error); showNotification('Failed to add provider.', 'error'); }
    };

    const toggleProviderAccess = async (providerId, currentAccess) => {
        if (!userId) return;
        try {
            const providerDocRef = doc(db, `artifacts/${appId}/users/${userId}/healthcareProviders`, providerId);
            await updateDoc(providerDocRef, { hasAccess: !currentAccess });
            showNotification(`Access for provider ${!currentAccess ? 'granted' : 'revoked'}.`);
        } catch (error) { console.error("Error toggling access:", error); showNotification('Failed to update access.', 'error'); }
    };

    const handleExportData = () => {
        const dataToExport = {
            patientId: userId,
            exportedOn: new Date().toISOString(),
            records: records,
            providers: providers
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `health_passport_${userId}.json`;
        link.click();
        showNotification('Data exported successfully!');
    };
    
    if (!isAuthReady) return <div className="flex items-center justify-center h-screen bg-gray-900"><LoadingSpinner /></div>;

    return (
        <div className="bg-slate-100 min-h-screen font-sans text-gray-800 relative overflow-hidden">
            <AnimatedBackground />
            <div className="relative z-10 container mx-auto p-4 md:p-8">
                <header className="mb-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">My Health Passport</h1>
                    <p className="text-lg text-gray-600 mt-3">The future of healthcare is in your hands.</p>
                </header>

                <DashboardMetrics records={records} providers={providers} />

                <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                    {/* Main Content: Medical Records */}
                    <div className="lg:col-span-4 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/80">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <div className="flex items-center">
                                <DocumentIcon className="h-8 w-8 mr-3 text-indigo-500" />
                                <h3 className="text-2xl font-bold text-gray-900">Medical Records</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleExportData} className="flex items-center bg-gray-600 text-white px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-all shadow-md font-semibold">
                                    <DownloadIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => setAddRecordModalOpen(true)} className="flex items-center bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all shadow-md font-semibold w-full sm:w-auto justify-center">
                                    <PlusCircleIcon /> Add Record
                                </button>
                            </div>
                        </div>
                        
                        {/* View Toggles */}
                        <div className="flex border-b border-gray-300 mb-4">
                            <button onClick={() => setActiveView('list')} className={`flex items-center px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'list' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                                <ListIcon className="h-5 w-5 mr-2" /> List View
                            </button>
                            <button onClick={() => setActiveView('timeline')} className={`flex items-center px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'timeline' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>
                                <TimelineIcon className="h-5 w-5 mr-2" /> Timeline View
                            </button>
                        </div>

                        {activeView === 'list' && (
                            <>
                                <RecordFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                                <div className="space-y-4 mt-6">
                                    {isLoading ? <LoadingSpinner /> : filteredRecords.length > 0 ? (
                                        filteredRecords.map(record => <MedicalRecordCard key={record.id} record={record} />)
                                    ) : (
                                        <p className="text-center text-gray-500 py-12">No records match your search or filter.</p>
                                    )}
                                </div>
                            </>
                        )}
                        {activeView === 'timeline' && <HealthTimeline records={records} />}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/80">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <UserGroupIcon className="h-8 w-8 mr-3 text-purple-500" />
                                    <h3 className="text-2xl font-bold text-gray-900">Providers</h3>
                                </div>
                                <button onClick={() => setAddProviderModalOpen(true)} className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all shadow-md font-semibold">
                                    <PlusCircleIcon /> Add
                                </button>
                            </div>
                            <div className="space-y-4">
                                {providers.length > 0 ? (
                                    providers.map(provider => <ProviderCard key={provider.id} provider={provider} onToggleAccess={toggleProviderAccess} />)
                                ) : (
                                    <p className="text-center text-gray-500 py-12">No providers linked.</p>
                                )}
                            </div>
                        </div>
                        <HealthAIChat records={records} />
                    </div>
                </div>
            </div>

            {isAddRecordModalOpen && <AddRecordModal onClose={() => setAddRecordModalOpen(false)} onAddRecord={handleAddRecord} />}
            {isAddProviderModalOpen && <AddProviderModal onClose={() => setAddProviderModalOpen(false)} onAddProvider={handleAddProvider} />}
            <Notification notification={notification} />
        </div>
    );
}

// --- Sub-Components ---
function AnimatedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = document.body.scrollHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let particles = [];
        const particleCount = Math.floor(canvas.width / 30);

        class Particle {
            constructor(x, y) {
                this.x = x || Math.random() * canvas.width;
                this.y = y || Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.color = 'rgba(79, 70, 229, 0.5)';
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
                this.x += this.speedX;
                this.y += this.speedY;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const connect = () => {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                                   ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    if (distance < (canvas.width / 8) * (canvas.height / 8)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(129, 140, 248, ${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            connect();
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
}


function DashboardMetrics({ records, providers }) {
    const criticalAlerts = records.filter(r => r.isCritical).length;
    
    const MetricCard = ({ title, value, icon, color }) => (
        <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-200/60 flex items-center">
            <div className={`mr-4 p-3 rounded-full bg-gradient-to-br ${color}`}>{icon}</div>
            <div>
                <p className="text-sm text-gray-600 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard title="Total Records" value={records.length} icon={<DocumentIcon className="h-6 w-6 text-white"/>} color="from-indigo-500 to-blue-500" />
            <MetricCard title="Linked Providers" value={providers.length} icon={<UserGroupIcon className="h-6 w-6 text-white"/>} color="from-purple-500 to-pink-500" />
            <MetricCard title="Critical Alerts" value={criticalAlerts} icon={<AlertIcon className="h-6 w-6 text-white"/>} color="from-red-500 to-yellow-500" />
        </div>
    );
}

function RecordFilters({ searchTerm, setSearchTerm, activeFilter, setActiveFilter }) {
    const filters = ['All', 'Consultation', 'Lab Result', 'Prescription', 'Imaging', 'Allergy'];
    return (
        <div className="space-y-4">
            <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white/80" />
            <div className="flex flex-wrap gap-2">
                {filters.map(filter => (
                    <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${activeFilter === filter ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MedicalRecordCard({ record }) {
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleSummarize = async () => {
        setIsSummarizing(true);
        setSummary('');
        const prompt = `You are a helpful medical assistant. Summarize the following medical record entry for a patient in simple, easy-to-understand terms. Do not provide medical advice. Focus on explaining what the record means.
        Record Type: ${record.type}
        Provider: ${record.provider}
        Date: ${record.date}
        Details: ${record.details}`;

        try {
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setSummary(text);
            } else {
                setSummary("Could not generate a summary at this time.");
            }
        } catch (error) {
            console.error("Error summarizing record:", error);
            setSummary("An error occurred while generating the summary.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const recordIcons = {
        Consultation: <StethoscopeIcon className="h-6 w-6 text-indigo-500" />,
        'Lab Result': <BeakerIcon className="h-6 w-6 text-green-500" />,
        Prescription: <PillIcon className="h-6 w-6 text-blue-500" />,
        Imaging: <DocumentIcon className="h-6 w-6 text-purple-500" />,
        Allergy: <AlertIcon className="h-6 w-6 text-red-500" />,
        default: <DocumentIcon className="h-6 w-6 text-gray-500" />,
    };

    return (
        <div className={`border rounded-xl p-5 bg-white/50 hover:bg-white/80 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] ${record.isCritical ? 'border-red-400 border-2' : 'border-gray-200/80'}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div className="mr-4">{recordIcons[record.type] || recordIcons.default}</div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">{record.type}</p>
                        <p className="text-sm text-gray-600">Provider: {record.provider}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                    {record.isCritical && <span className="mt-1 text-xs font-bold text-red-600 flex items-center"><AlertIcon className="h-4 w-4 mr-1"/>CRITICAL</span>}
                </div>
            </div>
            <p className="mt-3 pl-10 text-gray-800">{record.details}</p>
            <div className="mt-4 pl-10">
                <button onClick={handleSummarize} disabled={isSummarizing} className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-wait transition-colors">
                    <GeminiIcon className="h-5 w-5 mr-2" />
                    {isSummarizing ? 'Summarizing...' : '✨ Summarize with AI'}
                </button>
                {summary && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-900">
                        <p className="font-bold mb-1">AI Summary:</p>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProviderCard({ provider, onToggleAccess }) {
    return (
        <div className="border border-gray-200/80 rounded-xl p-4 flex justify-between items-center bg-white/50 hover:bg-white/80 transition-all duration-300 shadow-md">
            <div>
                <p className="font-bold text-gray-800">{provider.name}</p>
                <p className="text-sm text-gray-500">{provider.facility}</p>
            </div>
            <button onClick={() => onToggleAccess(provider.id, provider.hasAccess)} className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 font-semibold flex items-center shadow-sm ${provider.hasAccess ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                {provider.hasAccess ? <LockOpenIcon /> : <LockClosedIcon />}
                <span className="ml-1.5">{provider.hasAccess ? 'Access' : 'Locked'}</span>
            </button>
        </div>
    );
}

function HealthAIChat({ records }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isAsking, setIsAsking] = useState(false);

    const handleAskAI = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setIsAsking(true);
        setAnswer('');

        const recordsContext = records.map(r => `- ${r.date} (${r.type}): ${r.details}`).join('\n');
        const prompt = `You are a helpful AI medical assistant. Based on the following health records, answer the user's question. Provide a general, informative answer. Do not provide medical advice, and include a disclaimer that the user should consult a real doctor.
        
        Health Records Context:
        ${recordsContext}
        
        User's Question: "${question}"`;

        try {
            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setAnswer(text);
            } else {
                setAnswer("I couldn't generate a response. Please try again.");
            }
        } catch (error) {
            console.error("Error asking AI:", error);
            setAnswer("An error occurred while getting an answer.");
        } finally {
            setIsAsking(false);
            setQuestion('');
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200/80">
            <div className="flex items-center mb-4">
                <GeminiIcon className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Ask AI Assistant</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Ask a question about your health records.</p>
            <form onSubmit={handleAskAI}>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., Why was I prescribed this?"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
                    disabled={isAsking}
                />
                <button type="submit" disabled={isAsking} className="w-full mt-3 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all shadow-md font-semibold disabled:opacity-70 disabled:cursor-wait">
                    {isAsking ? 'Thinking...' : '✨ Ask AI'}
                </button>
            </form>
            { (isAsking || answer) && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-900">
                    {isAsking ? (
                        <div className="flex items-center justify-center"><LoadingSpinner /></div>
                    ) : (
                        <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
                    )}
                </div>
            )}
        </div>
    );
}

function AddRecordModal({ onClose, onAddRecord }) {
    const [record, setRecord] = useState({ type: 'Consultation', provider: '', date: new Date().toISOString().split('T')[0], details: '', isCritical: false });
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRecord(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!record.provider || !record.details) { alert("Please fill in all fields."); return; }
        onAddRecord(record);
    };
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"><XIcon /></button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Medical Record</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Record Type</label>
                        <select name="type" value={record.type} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50">
                            <option>Consultation</option><option>Lab Result</option><option>Prescription</option><option>Imaging</option><option>Allergy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Provider Name</label>
                        <input type="text" name="provider" value={record.provider} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g., Dr. Jane Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" name="date" value={record.date} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Details / Summary</label>
                        <textarea name="details" value={record.details} onChange={handleChange} rows="4" className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g., Annual check-up, all vitals normal."></textarea>
                    </div>
                    <div className="flex items-center">
                        <input id="isCritical" name="isCritical" type="checkbox" checked={record.isCritical} onChange={handleChange} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                        <label htmlFor="isCritical" className="ml-2 block text-sm text-gray-900 font-medium">Mark as Critical Alert (e.g., severe allergy)</label>
                    </div>
                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                        <button type="submit" className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg font-semibold transition-shadow">Add Record</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddProviderModal({ onClose, onAddProvider }) {
    const [provider, setProvider] = useState({ name: '', facility: '' });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProvider(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!provider.name || !provider.facility) { alert("Please fill in all fields."); return; }
        onAddProvider(provider);
    };
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"><XIcon /></button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Healthcare Provider</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Provider Name</label>
                        <input type="text" name="name" value={provider.name} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g., Dr. John Smith" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hospital / Facility</label>
                        <input type="text" name="facility" value={provider.facility} onChange={handleChange} className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" placeholder="e.g., Parkview Regional Medical Center" />
                    </div>
                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors">Cancel</button>
                        <button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg font-semibold transition-shadow">Add Provider</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Notification({ notification }) {
    if (!notification.show) return null;
    const baseStyle = "fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl text-white transition-all duration-300 z-50";
    const typeStyle = notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-orange-500';
    const animationStyle = notification.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';
    return <div className={`${baseStyle} ${typeStyle} ${animationStyle}`}>{notification.message}</div>;
}

const recordIcons = {
    Consultation: <StethoscopeIcon className="h-6 w-6 text-white" />,
    'Lab Result': <BeakerIcon className="h-6 w-6 text-white" />,
    Prescription: <PillIcon className="h-6 w-6 text-white" />,
    Imaging: <DocumentIcon className="h-6 w-6 text-white" />,
    Allergy: <AlertIcon className="h-6 w-6 text-white" />,
    default: <DocumentIcon className="h-6 w-6 text-white" />,
};

const recordIconColors = {
    Consultation: 'bg-indigo-500',
    'Lab Result': 'bg-green-500',
    Prescription: 'bg-blue-500',
    Imaging: 'bg-purple-500',
    Allergy: 'bg-red-500',
    default: 'bg-gray-500',
};

function HealthTimeline({ records }) {
    if (records.length === 0) {
        return <p className="text-center text-gray-500 py-12">No records to display in timeline.</p>;
    }
    
    // Create a copy before sorting to avoid mutating the prop
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="mt-6 flow-root">
            <ul className="-mb-8">
                {sortedRecords.map((record, recordIdx) => (
                    <li key={record.id}>
                        <div className="relative pb-8">
                            {recordIdx !== sortedRecords.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-300" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ${recordIconColors[record.type] || recordIconColors.default}`}>
                                        {recordIcons[record.type] || recordIcons.default}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {record.type} with <span className="font-medium text-gray-900">{record.provider}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-gray-700">{record.details}</p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={record.date}>{new Date(record.date).toLocaleDateString()}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
