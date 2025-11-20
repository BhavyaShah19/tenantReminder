'use client'
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Building2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { STATUS } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';


type Bill = {
  id: string,
  unitId: string,
  amount: number,
  billType: string,
  dueDate: string,
  status: string,
  dateSent: string,
  datePaid: string,
  proofURL: string,
}

type Tenant = {
  id: string,
  name: string,
  phone: string,
  unitName: string,
}

const Confirm = () => {
  const params = useParams();
  const billID = params.billId;
  const {toast} = useToast();
  const [bill, setBill] = useState<Bill | null>(null);
  const [tenant, setTenant] = useState<Tenant[]>([]);
  const [proofUrl, setProofUrl] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isFetchingBill, setIsFetchingBill] = useState(false)

  async function fetchBillId() {
    setIsFetchingBill(true)
    const res = await axios.get(`/api/bills/${billID}`)
    const unitRelatedToThisBill = res.data.data.unitId
    const tenantsRelatedToThisUnit = await axios.get(`/api/units/${unitRelatedToThisBill}/tenants`)
    const bills = res.data.data
    const tenants = tenantsRelatedToThisUnit.data.data
    if (bills) {
      setBill(bills);
      setTenant(tenants);
    }
    setIsFetchingBill(false)
  }

  useEffect(() => {
    fetchBillId()
  }, [billID]);

  const handleConfirm = async () => {
    try {
      if (!bill) return;
      const res = await axios.put(`/api/bills/${billID}`, {
        status: STATUS.CONFIRMED,
        datePaid: new Date().toISOString(),
        tenantProofUrl: proofUrl || undefined
      })
      if (res.data.success) {
        setConfirmed(true);
        toast({
          title: 'Confirmation Sent to your landlord',
          description: 'Bill confirmed successfully',
        });
      }
      else{
        toast({
          title: 'Error',
          description: 'Error confirming bill,try again after sometime in else',
        });
      }
    } catch (error) {
        console.log("Error confirming bill", error)
        toast({
          title: 'Error',
          description: 'Error confirming bill,try again after sometime',
        });
    } 
  };
  if(isFetchingBill){ return <div className="min-h-screen flex items-center justify-center bg-background"><p>Loading...</p></div>}

  if (!bill || !tenant) {
    return (
      !isFetchingBill
        ?
      (<div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Bill not found or invalid link.</p>
          </CardContent>
        </Card>
      </div>):
      (<p>Loading</p>)
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-success flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Payment Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Thank you! Your payment confirmation has been sent to your landlord.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit:</span>
              {tenant.map(t =>
                <span  key ={t.id} className="font-medium">{t.unitName}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bill Type:</span>
              <span className="font-medium">{bill.billType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-lg">Rs.{bill.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-medium">{new Date(bill.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="proofUrl">Upload Proof of Payment (Optional)</Label>
            <Input
              id="proofUrl"
              type="url"
              placeholder="https://..."
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload your payment receipt to a cloud service and paste the link
            </p>
          </div>

          <Button variant="outline"
            onClick={handleConfirm}
            className="w-full bg-success"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            I Have Paid This Bill
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirm;
