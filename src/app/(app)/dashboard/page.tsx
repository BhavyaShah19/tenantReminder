'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText, LogOut, Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BillType, TenantType, UnitType } from '@/schemas/signInSchema';
import { STATUS } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';


const Dashboard = () => {
    const router = useRouter()
    const {toast} = useToast()
    const [units, setUnits] = useState<UnitType[]>([]);
    const [tenants, setTenants] = useState<TenantType[]>([]);
    const [bills, setBills] = useState<BillType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchOwnerData() {
        setIsLoading(true)
        const ownerUnits = await axios.get(`/api/units`)
        if (ownerUnits.status === 200) {
            setUnits(ownerUnits.data.data)
        }
        const totalTenants = await axios.get(`/api/tenants`)
        if (totalTenants.status === 200) {
            setTenants(totalTenants.data.data)
        }
        setIsLoading(false)
        // get bills for every unit 
    }
    useEffect(() => {
        //    tenants,bills,units
        fetchOwnerData()
    }, [])

    const upcomingBills = bills.filter(bill => {
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0 && bill.status === STATUS.PENDING;
    });

    const confirmedBills = bills.filter(b => b.status === STATUS.CONFIRMED).length;

    const handleLogout = () => {
        signOut();
        toast({
            title: 'Logged Out',
            description: 'You have been logged out successfully',
        });
        router.push('/signin');
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold"> Pro</h1>
                    </div>
                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Loading Your Dashboard.....</p>
                </div>
            ) : (
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{units.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{tenants.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Bills (7 days)</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{upcomingBills.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {confirmedBills > 0 && (
                    <Card className="mb-6 border-accent bg-accent/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                <p className="text-sm font-medium">
                                    {confirmedBills} bill{confirmedBills > 1 ? 's' : ''}    confirmed by tenants - awaiting verification
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/units')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Manage Units
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Add and manage rental units and tenant information</p>
                            <Button className="mt-4 w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Manage Units
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/new-bill')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Send Bill Notification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Forward utility bills instantly to tenants</p>
                            <Button className="mt-4 w-full bg-accent hover:bg-accent/90">
                                <Plus className="h-4 w-4 mr-2" />
                                New Notification
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-lg transition-shadow md:col-span-2" onClick={() => router.push('/history')}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Payment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">View all sent notifications and payment statuses</p>
                            <Button variant="outline" className="mt-4 w-full">
                                View History
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
            )}
        </div>
    );
};

export default Dashboard;
