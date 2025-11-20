'use client'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { billSchema } from '@/schemas/signInSchema';
import { useRouter } from 'next/navigation';
import { UnitType } from '@/schemas/signInSchema';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {STATUS} from '@prisma/client';


type BillFormData = z.infer<typeof billSchema>;

const NewBill = () => {
  //   const { units, addBill } = useApp();
  const billTypes = ['Electricity', 'Water', 'Gas', 'Maintenance', 'Internet', 'Other'];
  const router = useRouter();
  const { toast } = useToast();
  const [units, setUnits] = useState<UnitType[]>([]);
  const [Loading, setLoading] = useState(false);

  async function fetchUnits() {
    setLoading(true)
    try {
      const unitsFetched = await axios.get('/api/units')
      if (unitsFetched.status === 200 && unitsFetched.data.data) {
        setUnits(unitsFetched.data.data)
        if (unitsFetched.data.data.length === 0) {
          console.warn("The API returned an empty array. Check your database.");
        }
        else {
          console.error("API response status was not 200 or data structure was invalid.");
        }
      }
    } catch (e) {
      console.error("Axios Failed to fetch units:");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUnits()
  }, [])


  const form = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      unitId: '',
      billType:'',
      amount: '',
      dueDate: '',
      status: STATUS.PENDING,
      proofUrl: '',
    },
  });

  const onSubmit = async (data: BillFormData) => {
    const selectedUnit = units.find(u => u.id === data.unitId);
    if (!selectedUnit || selectedUnit.tenants.length === 0) return;


    const res = await axios.post('/api/bills', {
      ...data,
      unitId: data.unitId,
      status: STATUS.PENDING,
    })

    if (res.data) {
      const confirmLink = `${window.location.origin}/confirm/${res.data.createdBill.id} `;
      selectedUnit.tenants.forEach((tenant) => {
        const message = `Hello ${tenant.name},You have a new ${data.billType} bill for Unit ${selectedUnit.unitName}:Amount: Rs${data.amount}Due Date: ${new Date(data.dueDate).toLocaleDateString()}Click here to confirm payment: ${confirmLink}`;

        const whatsappLink = `https://wa.me/${tenant.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
      });

      toast({
        title: 'Notifications Sent!',
        description: `Bill notification sent to ${selectedUnit.tenants.length} tenant(s) in Unit ${selectedUnit.unitName}`,
        className: 'bg-success text-success-foreground',
      });

      form.reset();
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Send Bill Notification</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Bill Notification</CardTitle>
          </CardHeader>
          <CardContent>
            {Loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Loading...</p>
              </div>
            ) :
              units.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No units available. Please add a unit first.</p>
                  <Button onClick={() => router.push('/units')}>Go to Units</Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="unitId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Unit</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  Unit {unit.unitName} ({unit.tenants.length} tenant{unit.tenants.length !== 1 ? 's' : ''})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="billType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bill Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bill type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {billTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (Rs.)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="proofUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proof URL (Optional)</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://..." {...field} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Upload your bill screenshot to a cloud service and paste the link here</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                      <Send className="h-4 w-4 mr-2" />
                      Send to All Tenants in Unit
                    </Button>
                  </form>
                </Form>
              )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewBill;
