'use client'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Clock, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BillType, TenantType } from '@/schemas/signInSchema';
import { STATUS } from '@prisma/client';


type BillWithTenant = BillType & { tenant: TenantType | null };

type BillWithUnitName = BillWithTenant & {
    unitName: string;
};


const History = () => {
    const router = useRouter()
    const { toast } = useToast();
    const [billsWithTenants, setBillsWithTenants] = useState<BillWithUnitName[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchOwnerData() {
        setIsLoading(true);
        try {
            setIsLoading(true)
            // 1. Fetch all bills
            const billsResponse = await axios.get(`/api/bills`);
            const billsArray: BillType[] = billsResponse.data.data;

            if (billsArray && billsArray.length > 0) {
                // 2. Fetch tenants for ALL bills concurrently (for better performance)
                const combinedDataPromises = billsArray.map(async (bill) => {
                    const tenantsResponse = await axios.get(`/api/units/${bill.unitId}/tenants`);

                    // Assuming your API returns an array of tenants for the unit
                    const firstTenant = tenantsResponse.data.data?.[0]?.tenants?.[0] || null;
                    const unitName = tenantsResponse.data.data?.[0]?.unitName

                    return {
                        ...bill, // Original bill data
                        tenant: firstTenant,
                        unitName: unitName
                    } as BillWithUnitName;
                });

                // 3. Wait for all tenant fetches to complete
                const combinedData = await Promise.all(combinedDataPromises);

                // 4. Sort and set state once
                const sortedAndCombined = combinedData.sort((a, b) =>
                    new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime()
                );

                setBillsWithTenants(sortedAndCombined);
                setIsLoading(false)
            }

        } catch (error) {
            console.error("Failed to fetch or process data:", error);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        fetchOwnerData()
    }, [])




    const sortedBills = [...billsWithTenants].sort((a, b) =>
        new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime()
    );

    const getTenant = async (unitId: string) => {
        const resp = await axios.get(`/api/units/${unitId}/tenants`)
        const FirstTenant = resp.data.data?.[0]?.tenants?.[0];
        if (FirstTenant) {
            return FirstTenant;
        } else {
            return null;
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case STATUS.PAID:
                return <Badge className="bg-success hover:bg-success/90"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
            case STATUS.CONFIRMED:
                return <Badge variant="default" className="bg-accent hover:bg-accent/90"><FileCheck className="h-3 w-3 mr-1" />Confirmed</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        }
    };

    const handleMarkPaid = async (billId: string) => {
        try {
            const res = await axios.put(`/api/bills/${billId}`, {
                status: STATUS.PAID,
                datePaid: new Date().toISOString(),
            })
            const updatedBill = res.data.data;
    
            if (res.data.success) {
                setBillsWithTenants(prevBills =>
                    prevBills.map(bill =>
                        bill.id === billId ? updatedBill : bill
                    )
                );
                toast({
                    title: 'Status Updated',
                    description: 'Bill marked as paid',
                    className: 'bg-success text-success-foreground'
                });
            }
            else{
                toast({
                    title: 'Error',
                    description: 'Error marking bill as paid,try later',
                    className: 'bg-error text-error-foreground'
                });
            }
            
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error marking bill as paid',
                className: 'bg-error text-error-foreground'
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-bold">Payment History</h1>
                </div>
            </header>
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Loading...</p>
                </div>
            ) : (
                <main className="container mx-auto px-4 py-8">
                    <div className="space-y-4">
                        {sortedBills.map((bill) => {
                            if(!bill)return null;
                            if (!bill.tenant) return null;

                            return (
                                <Card key={bill.id} className={bill.status === STATUS.CONFIRMED ? 'border-accent' : ''}>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold"> {bill.unitName}</h3>
                                                    {getStatusBadge(bill.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{bill.tenant.name}</p>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Type:</span> {bill.billType}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Amount:</span> Rs.{bill.amount}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Due:</span> {new Date(bill.dueDate).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Sent:</span> {new Date(bill.dateSent).toLocaleDateString()}
                                                    </div>
                                                    {bill.datePaid && (
                                                        <div className="col-span-2">
                                                            <span className="text-muted-foreground">Paid:</span> {new Date(bill.datePaid).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                {bill.proofURL && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={bill.proofURL}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline"
                                                        >
                                                            View Tenant's Proof
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {bill.status === STATUS.CONFIRMED && (
                                                <Button
                                                    onClick={() => handleMarkPaid(bill.id)}
                                                    className="bg-success hover:bg-success/90"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Mark as Paid
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {billsWithTenants.length === 0 && (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">No bill notifications sent yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
};

export default History;
