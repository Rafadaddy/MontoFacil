
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Send, FileText, Trash2, Wallet, User, DollarSign, Pencil, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Payment {
  id: string;
  clientName: string;
  amount: number;
  timestamp: string;
}

export default function Home() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // State for Editing Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('daily_payments');
    if (saved) {
      setPayments(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('daily_payments', JSON.stringify(payments));
    }
  }, [payments, mounted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount) return;

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: clientName.trim(),
      amount: parseFloat(amount),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPayments([...payments, newPayment]);
    setClientName('');
    setAmount('');
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setEditClientName(payment.clientName);
    setEditAmount(payment.amount.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingPayment || !editClientName.trim() || !editAmount) return;

    setPayments(payments.map(p => 
      p.id === editingPayment.id 
        ? { ...p, clientName: editClientName.trim(), amount: parseFloat(editAmount) } 
        : p
    ));
    setIsEditDialogOpen(false);
    setEditingPayment(null);
  };

  const deletePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const shareSummary = () => {
    const date = new Date().toLocaleDateString();
    const list = payments.map(p => `- ${p.clientName}: $${p.amount.toFixed(2)}`).join('\n');
    const text = `*CIERRE DE DÍA - ${date}*\n\n*Detalle de Cobros:*\n${list}\n\n*TOTAL DEL DÍA: $${totalAmount.toFixed(2)}*`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const exportPDF = () => {
    window.print();
  };

  const clearDay = () => {
    setPayments([]);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-2xl mb-8 flex flex-col items-center text-center no-print">
        <div className="bg-primary rounded-full p-4 mb-4 shadow-lg shadow-primary/20">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-primary tracking-tight font-headline uppercase">Monto Fácil</h1>
        <p className="text-muted-foreground text-xl mt-2 font-medium">Control diario de cobros</p>
      </header>

      {/* Printable Report Header */}
      <div className="print-only w-full max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center border-b-2 pb-4 mb-6 uppercase">Reporte Diario de Cobros</h1>
        <div className="flex justify-between text-xl font-semibold">
          <p>Fecha: {new Date().toLocaleDateString()}</p>
          <p>Registros: {payments.length}</p>
        </div>
      </div>

      <main className="w-full max-w-2xl space-y-6">
        {/* Input Form */}
        <Card className="no-print border-none shadow-2xl bg-white/90 backdrop-blur-md rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-accent/5 pb-2">
            <CardTitle className="text-2xl font-black flex items-center gap-2 uppercase text-accent">
              <Plus className="w-7 h-7" />
              Nuevo Cobro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-xl font-bold flex items-center gap-2 ml-1 text-foreground/80">
                  <User className="w-6 h-6 text-primary" />
                  Nombre del Cliente
                </label>
                <Input
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-xl py-8 border-2 focus:border-primary transition-all rounded-2xl placeholder:text-muted-foreground/30 font-bold"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-xl font-bold flex items-center gap-2 ml-1 text-foreground/80">
                  <DollarSign className="w-6 h-6 text-primary" />
                  Monto a Cobrar
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-3xl py-10 border-2 focus:border-primary transition-all rounded-2xl font-black text-primary text-center"
                  required
                />
              </div>
              <Button type="submit" className="w-full py-10 text-2xl font-black rounded-2xl bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 transition-transform active:scale-95 uppercase tracking-wider">
                Registrar Pago
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Total Display */}
        <Card className="bg-primary text-white overflow-hidden border-none shadow-2xl relative rounded-[2rem]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-20 h-20" />
          </div>
          <CardContent className="p-6 text-center flex flex-col items-center">
            <span className="text-primary-foreground/90 text-sm uppercase tracking-[0.2em] font-black mb-1">Total del Día</span>
            <div className="text-7xl font-black tabular-nums font-headline drop-shadow-md">
              ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-primary-foreground/70 text-lg font-bold">
              {payments.length} recibos generados
            </div>
          </CardContent>
        </Card>

        {/* Payment List Table */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="border-b-2 bg-muted/20 py-6">
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter text-primary">
              <FileText className="w-6 h-6" />
              Lista de Cobros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/10 border-b-2">
                  <TableHead className="font-black text-lg py-5 pl-8 uppercase text-foreground">Cliente</TableHead>
                  <TableHead className="font-black text-lg py-5 text-right uppercase text-foreground">Monto</TableHead>
                  <TableHead className="font-black text-lg py-5 text-center pr-8 uppercase no-print text-foreground w-32">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-64 text-center text-muted-foreground text-2xl italic font-bold">
                      Aún no hay cobros hoy
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="group transition-colors hover:bg-muted/5 border-b-2">
                      <TableCell className="py-7 pl-8">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">{p.clientName}</span>
                          <span className="text-sm text-muted-foreground font-bold mt-1 no-print">{p.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-7 text-right">
                        <span className="text-3xl font-black text-primary tabular-nums">
                          ${p.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="py-7 pr-8 text-right no-print">
                        <div className="flex justify-end gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditDialog(p)}
                            className="text-primary hover:bg-primary/10 rounded-2xl h-14 w-14 border-2 border-primary/20"
                          >
                            <Pencil className="w-7 h-7" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:bg-destructive/10 rounded-2xl h-14 w-14 border-2 border-destructive/20"
                              >
                                <Trash2 className="w-7 h-7" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10">
                              <AlertDialogHeader>
                                <div className="mx-auto bg-destructive/10 p-5 rounded-full mb-4 w-fit">
                                  <Trash2 className="w-10 h-10 text-destructive" />
                                </div>
                                <AlertDialogTitle className="text-3xl font-black text-center uppercase tracking-tight">¿Eliminar cobro?</AlertDialogTitle>
                                <AlertDialogDescription className="text-xl text-center mt-2 font-medium">
                                  Vas a borrar el registro de <span className="font-black text-foreground">{p.clientName}</span> por <span className="font-black text-primary">${p.amount.toFixed(2)}</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-8">
                                <AlertDialogCancel className="py-8 rounded-2xl flex-1 border-2 text-xl font-black uppercase">Atrás</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePayment(p.id)} className="py-8 rounded-2xl flex-1 bg-destructive hover:bg-destructive/90 text-xl font-black uppercase shadow-lg shadow-destructive/20">
                                  Sí, borrar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 p-8 bg-muted/5 no-print border-t-2">
            <Button 
              onClick={shareSummary} 
              disabled={payments.length === 0}
              variant="outline" 
              className="w-full py-10 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-2xl font-black text-primary rounded-2xl uppercase"
            >
              <Send className="w-7 h-7 mr-3" />
              Enviar a WhatsApp
            </Button>
            <Button 
              onClick={exportPDF} 
              disabled={payments.length === 0}
              variant="outline" 
              className="w-full py-10 border-2 border-accent/30 hover:border-accent hover:bg-accent/5 text-2xl font-black text-accent rounded-2xl uppercase"
            >
              <FileText className="w-7 h-7 mr-3" />
              Generar Reporte
            </Button>
          </CardFooter>
        </Card>

        {/* Reset Action */}
        <div className="flex justify-center pt-8 no-print">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 py-8 px-12 rounded-2xl text-xl font-black uppercase tracking-tighter"
                disabled={payments.length === 0}
              >
                <Trash2 className="w-6 h-6 mr-3" />
                Limpiar todo el día
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[3rem] border-none shadow-2xl p-12">
              <AlertDialogHeader>
                <div className="mx-auto bg-destructive/10 p-6 rounded-full mb-6 w-fit">
                  <Wallet className="w-12 h-12 text-destructive" />
                </div>
                <AlertDialogTitle className="text-4xl font-black text-center uppercase tracking-tighter">¿Cerrar el día?</AlertDialogTitle>
                <AlertDialogDescription className="text-xl text-center mt-4 font-medium leading-relaxed">
                  Esto borrará **TODOS** los cobros de hoy para empezar de cero mañana. ¡Asegúrate de haber enviado tu resumen primero!
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-10">
                <AlertDialogCancel className="py-8 rounded-[2rem] flex-1 border-2 text-xl font-black uppercase">Volver</AlertDialogCancel>
                <AlertDialogAction onClick={clearDay} className="py-8 rounded-[2rem] flex-1 bg-destructive hover:bg-destructive/90 text-xl font-black uppercase shadow-xl shadow-destructive/30">
                  Borrar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      {/* Dedicated Edit Screen (Dialog) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-md w-[95%]">
          <DialogHeader>
            <div className="mx-auto bg-accent/10 p-5 rounded-full mb-4 w-fit">
              <Pencil className="w-10 h-10 text-accent" />
            </div>
            <DialogTitle className="text-3xl font-black text-center uppercase tracking-tight">Editar Cobro</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <label className="text-xl font-black ml-1 text-foreground/70 uppercase text-xs tracking-widest">Nombre Cliente</label>
              <Input
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="text-xl py-8 border-2 rounded-2xl font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xl font-black ml-1 text-foreground/70 uppercase text-xs tracking-widest">Monto Cobrado</label>
              <Input
                type="number"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="text-3xl py-10 border-2 rounded-2xl font-black text-primary text-center"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="py-8 rounded-2xl flex-1 border-2 text-xl font-black uppercase"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate}
              className="py-8 rounded-2xl flex-1 bg-accent hover:bg-accent/90 text-xl font-black uppercase shadow-lg shadow-accent/20"
            >
              <Check className="w-6 h-6 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full mt-16 pb-12 text-center text-muted-foreground no-print border-t pt-8">
        <p className="text-xl font-black uppercase tracking-widest text-primary/40">Monto Fácil &copy; {new Date().getFullYear()}</p>
        <p className="text-sm mt-2 font-bold uppercase tracking-tighter opacity-50">Hecho para agilizar tu trabajo</p>
      </footer>
    </div>
  );
}
