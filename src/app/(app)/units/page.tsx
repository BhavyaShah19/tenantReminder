'use client'
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Building2, Plus, ArrowLeft, Trash2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { unitSchema, tenantSchema } from '@/schemas/signInSchema';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type UnitFormData = z.infer<typeof unitSchema>;
type SingleTenantFormData = z.infer<typeof tenantSchema>;

type Tenant = {
    id: string,
    name: string,
    phoneNumber: string,
    leaseStart: string,
    leaseEnd: string
}

type Unit = {
    id: string,
    unitName: string,
    tenants: Tenant[]
}

const Units = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [units, setUnits] = useState<Unit[]>([])
    const [isLoading, setisLoading] = useState(false)
    const [openAddUnit, setOpenAddUnit] = useState(false);
    const [selectedUnitForTenant, setSelectedUnitForTenant] = useState<string | null>(null);

    async function fetchUnits() {
        try {
            setisLoading(true)
            const res = await axios.get(`/api/units`)
            if (res.status === 200) {
                setUnits(res.data.data)
            }
            else {
                console.log("Error fetching units")
            }
            setisLoading(false)
        } catch (error) {
            console.log("Error fetching units")
        }
    }
    useEffect(() => {
        fetchUnits()
    }, [])

    const form = useForm<UnitFormData>({
        resolver: zodResolver(unitSchema),
        defaultValues: {
            unitName: '',
            tenants: [{ name: '', phoneNumber: '', leaseStart: '', leaseEnd: '' }],
        },
    });
    const tenantForm = useForm<SingleTenantFormData>({
        resolver: zodResolver(tenantSchema),
        defaultValues: {
            name: '',
            phoneNumber: '',
            leaseStart: '',
            leaseEnd: ''
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'tenants',
    });

    const onSubmitUnit = async (data: UnitFormData) => {
        try {
            const res = await axios.post(`/api/units`, data)
            if (res.data.success) {
                toast({
                    title: 'Unit Added',
                    description: `Unit ${data.unitName} with ${data.tenants.length} tenant(s) added successfully`,
                });
                form.reset({
                    unitName: '',
                    tenants: [{ name: '', phoneNumber: '', leaseStart: '', leaseEnd: '' }],
                });
                setOpenAddUnit(false);
                setUnits([...units, res.data.data])
            }
            else {
                toast({
                    title: 'Error',
                    description: res.data.message,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error adding unit',
            });
        }
    };

    const onSubmitTenant = async (data: SingleTenantFormData) => {
        try {

            if (selectedUnitForTenant) {
                const res = await axios.patch(`/api/units/${selectedUnitForTenant}/tenants`, data)
                const addedTenant=res.data.data.tenants[res.data.data.tenants.length-1]
                if (res.data.success) {
                    toast({
                        title: 'Tenant Added',
                        description: 'Tenant added to unit successfully',
                    });
                    tenantForm.reset({
                        name: '',
                        phoneNumber: '',
                        leaseStart: '',
                        leaseEnd: '',
                    });
                    setUnits(units.map(u => {
                        if (u.id === selectedUnitForTenant) {
                            return {
                                ...u,
                                tenants: [...u.tenants, addedTenant]
                            }
                        }
                        return u
                    }))
                    setSelectedUnitForTenant(null);
                }
                else {
                    toast({
                        title: 'Error',
                        description: 'Error adding tenant to unit Try again after some time',
                    });
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error adding tenant to unit.',
            });
        }
    };

    const handleDeleteTenant = async (unitId: string, tenantId: string, unitName: string) => {
        try {
            if (confirm('Delete this tenant?')) {

                const res = await axios.delete(`/api/units/${unitId}/tenants/${tenantId}`)
                if (res.data.success) {
                    toast({ title: 'Tenant Deleted', description: `Tenant removed from Unit ${unitName}` });
                    setUnits(units.map(u => {
                        if (u.id === unitId) {
                            return {
                                ...u,
                                tenants: u.tenants.filter(t => t.id !== tenantId)
                            }
                        }
                        else {
                            return u
                        }
                    }))
                }
                else {
                    toast({
                        title: 'Error',
                        description: 'Error deleting tenant from unit',
                    });
                }
            }
        } catch (error) {

        }
    };

    const handleDeleteUnit = async (unitId: string, unitName: string) => {
        try {
            if (confirm('Delete this entire unit and all its tenants?')) {
                const resp = await axios.delete(`/api/units/${unitId}`)
                if (resp.data.success) {
                    toast({ title: 'Unit Deleted', description: `Unit ${unitName} deleted successfully` });
                    setUnits(units.filter(u => u.id !== unitId))
                }
                else {
                    toast({
                        title: 'Error',
                        description: 'Error deleting unit',
                    });
                }
            }
        } catch (error) {
            console.log("Error deleting unit", error)
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Building2 className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold">Manage Units</h1>
                </div>
            </header>
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Loading Your Units and Tenants.....</p>
                </div>
            ) : (
                <main className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">Rental Units</h2>
                        <Dialog open={openAddUnit} onOpenChange={setOpenAddUnit}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Unit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Unit</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmitUnit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="unitName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold">Tenants</h3>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => append({ name: '', phoneNumber: '', leaseStart: '', leaseEnd: '' })}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Another Tenant
                                                </Button>
                                            </div>

                                            {fields.map((field, index) => (
                                                <Card key={field.id}>
                                                    <CardHeader>
                                                        <CardTitle className="text-base flex justify-between items-center">
                                                            <span>Tenant {index + 1}</span>
                                                            {fields.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            )}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`tenants.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Tenant Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`tenants.${index}.phoneNumber`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Phone Number (with country code)</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="+1234567890" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField
                                                                control={form.control}
                                                                name={`tenants.${index}.leaseStart`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Lease Start</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="date" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name={`tenants.${index}.leaseEnd`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Lease End</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="date" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>

                                        <Button type='submit' className="w-full">Add Unit</Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {units.map((unit) => (
                            <Card key={unit.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Unit {unit.unitName}</span>
                                        <div className="flex gap-2">
                                            <Dialog open={selectedUnitForTenant === unit.id} onOpenChange={(open: Boolean) => setSelectedUnitForTenant(open ? unit?.id : null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" title="Add Tenant">
                                                        <UserPlus className="h-4 w-4 text-primary" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Add Tenant to Unit {unit.unitName}</DialogTitle>
                                                    </DialogHeader>
                                                    <Form {...tenantForm}>
                                                        <form onSubmit={tenantForm.handleSubmit(onSubmitTenant)} className="space-y-4">
                                                            <FormField
                                                                control={tenantForm.control}
                                                                name="name"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Tenant Name</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={tenantForm.control}
                                                                name="phoneNumber"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Phone Number (with country code)</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} placeholder="+1234567890" />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={tenantForm.control}
                                                                name="leaseStart"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Lease Start Date</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="date" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={tenantForm.control}
                                                                name="leaseEnd"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Lease End Date</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="date" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button type="submit" className="w-full">Add Tenant</Button>
                                                        </form>
                                                    </Form>
                                                </DialogContent>
                                            </Dialog>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteUnit(unit.id, unit.unitName)}
                                                title="Delete Unit"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Tenants ({unit.tenants.length})</p>
                                        {unit.tenants.map((tenant) => (
                                            <Card key={tenant.id} className="mb-2 bg-muted/30">
                                                <CardContent className="p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1 flex-1">
                                                            <p className="font-medium">{tenant.name}</p>
                                                            <p className="text-sm text-muted-foreground">{tenant.phoneNumber}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {tenant.leaseStart
                                                                    ? new Date(tenant.leaseStart).toLocaleDateString()
                                                                    : 'Start Date Missing'}
                                                                {' - '}
                                                                {tenant.leaseEnd
                                                                    ? new Date(tenant.leaseEnd).toLocaleDateString()
                                                                    : 'End Date Missing'}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleDeleteTenant(unit.id, tenant?.id, unit.unitName)}
                                                        >
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {
                        units.length === 0 && (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">No units added yet. Click "Add Unit" to get started.</p>
                                </CardContent>
                            </Card>
                        )
                    }
                </main>
            )
            }
        </div >
    );
};

export default Units;
