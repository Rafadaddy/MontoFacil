"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Send, FileText, Trash2, Wallet, User, DollarSign, Pencil, Check, ReceiptText } from 'lucide-react';
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
      <header className="w-full max-w-2xl mb-12 flex flex-col items-center text-center no-print">
        <div className="bg-primary rounded-3xl p-5 mb-6 shadow-2xl shadow-primary/30 transform rotate-3">
          <Wallet className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-6xl font-black text-primary tracking-tighter uppercase italic leading-none">Monto Fácil</h1>
        <div className="bg-accent/20 px-4 py-1 rounded-full mt-3">
          <p className="text-accent-foreground text-sm font-black uppercase tracking-widest">Control Profesional de Cobros</p>
        </div>
      </header>

      {/* Printable Report Header */}
      <div className="print-only w-full max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center border-b-2 pb-4 mb-6 uppercase">Reporte Diario de Cobros</h1>
        <div className="flex justify-between text-xl font-semibold">
          <p>Fecha: {new Date().toLocaleDateString()}</p>
          <p>Registros: {payments.length}</p>
        </div>
      </div>

      <main className="w-full max-w-2xl space-y-8">
        {/* Input Form */}
        <Card className="no-print border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-accent/10 border-b border-accent/10 py-6">
            <CardTitle className="text-2xl font-black flex items-center gap-2 uppercase text-accent-foreground/80 tracking-tight">
              <Plus className="w-8 h-8 text-accent" />
              Nuevo Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black flex items-center gap-2 ml-1 text-muted-foreground uppercase tracking-widest">
                  <User className="w-5 h-5 text-primary" />
                  Nombre del Cliente
                </label>
                <Input
                  placeholder="Ej. María García"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-2xl py-8 border-2 bg-muted/30 focus:bg-white focus:border-primary transition-all rounded-2xl placeholder:text-muted-foreground/30 font-bold px-6"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black flex items-center gap-2 ml-1 text-muted-foreground uppercase tracking-widest">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Monto Cobrado
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-4xl py-12 border-2 bg-muted/30 focus:bg-white focus:border-primary transition-all rounded-2xl font-black text-primary text-center px-6"
                  required
                />
              </div>
              <Button type="submit" className="w-full py-12 text-2xl font-black rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all active:scale-95 uppercase tracking-widest">
                Registrar Pago
              </Button>
            </form>
          </CardContent>
          <div className="h-4 bg-accent/20"></div>
        </Card>

        {/* Total Display */}
        <Card className="bg-primary text-white overflow-hidden border-none shadow-2xl relative rounded-[2.5rem] py-2">
          <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4">
            <ReceiptText className="w-32 h-32" />
          </div>
          <CardContent className="p-6 text-center flex flex-col items-center relative z-10">
            <span className="text-primary-foreground/60 text-xs uppercase tracking-[0.3em] font-black mb-2">Total Recaudado Hoy</span>
            <div className="text-7xl font-black tabular-nums font-headline drop-shadow-2xl">
              ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-3 px-4 py-1 bg-white/10 rounded-full text-primary-foreground/80 text-sm font-bold uppercase tracking-tighter">
              {payments.length} recibos activos
            </div>
          </CardContent>
        </Card>

        {/* Payment List Table */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
          <CardHeader className="border-b-2 border-muted bg-muted/30 py-6 px-8">
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight text-primary">
              <ReceiptText className="w-7 h-7" />
              Historial de Cobros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/20 border-b-2">
                  <TableHead className="font-black text-xs py-5 pl-8 uppercase text-muted-foreground tracking-widest">Cliente</TableHead>
                  <TableHead className="font-black text-xs py-5 text-right uppercase text-muted-foreground tracking-widest">Monto</TableHead>
                  <TableHead className="font-black text-xs py-5 text-center pr-8 uppercase no-print text-muted-foreground tracking-widest w-32">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-72 text-center text-muted-foreground/40 text-2xl italic font-black uppercase">
                      No hay registros
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="group transition-colors hover:bg-muted/30 border-b-2 border-muted/50">
                      <TableCell className="py-8 pl-8">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{p.clientName}</span>
                          <span className="text-xs text-muted-foreground font-black mt-2 no-print opacity-50">{p.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-8 text-right">
                        <span className="text-3xl font-black text-primary tabular-nums tracking-tighter">
                          ${p.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="py-8 pr-8 text-right no-print">
                        <div className="flex justify-end gap-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditDialog(p)}
                            className="text-primary hover:bg-primary/10 rounded-2xl h-14 w-14 border-2 border-primary/10"
                          >
                            <Pencil className="w-7 h-7" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:bg-destructive/10 rounded-2xl h-14 w-14 border-2 border-destructive/10"
                              >
                                <Trash2 className="w-7 h-7" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[3rem] border-none shadow-2xl p-10">
                              <AlertDialogHeader>
                                <div className="mx-auto bg-destructive/10 p-6 rounded-full mb-6 w-fit">
                                  <Trash2 className="w-12 h-12 text-destructive" />
                                </div>
                                <AlertDialogTitle className="text-3xl font-black text-center uppercase tracking-tighter">¿Borrar registro?</AlertDialogTitle>
                                <AlertDialogDescription className="text-xl text-center mt-2 font-medium">
                                  Vas a eliminar el cobro de <span className="font-black text-foreground">{p.clientName}</span> por <span className="font-black text-primary">${p.amount.toFixed(2)}</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-10">
                                <AlertDialogCancel className="py-8 rounded-[2rem] flex-1 border-2 text-xl font-black uppercase">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePayment(p.id)} className="py-8 rounded-[2rem] flex-1 bg-destructive hover:bg-destructive/90 text-xl font-black uppercase shadow-xl shadow-destructive/30">
                                  Eliminar
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
          <CardFooter className="flex flex-col sm:flex-row gap-6 p-10 bg-muted/10 no-print border-t border-muted justify-center">
            <Button 
              onClick={shareSummary} 
              disabled={payments.length === 0}
              variant="outline" 
              className="w-full sm:w-auto py-10 px-10 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-2xl font-black text-primary rounded-2xl uppercase flex items-center justify-center min-w-[260px] shadow-xl shadow-primary/5"
            >
              <Send className="w-8 h-8 mr-3" />
              WhatsApp
            </Button>
            <Button 
              onClick={exportPDF} 
              disabled={payments.length === 0}
              variant="outline" 
              className="w-full sm:w-auto py-10 px-10 border-2 border-accent/40 hover:border-accent hover:bg-accent/5 text-2xl font-black text-accent-foreground rounded-2xl uppercase flex items-center justify-center min-w-[260px] shadow-xl shadow-accent/5"
            >
              <FileText className="w-8 h-8 mr-3 text-accent" />
              Reporte
            </Button>
          </CardFooter>
        </Card>

        {/* Reset Action */}
        <div className="flex justify-center pt-10 no-print">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 py-8 px-12 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em]"
                disabled={payments.length === 0}
              >
                <Trash2 className="w-5 h-5 mr-3" />
                Reiniciar Jornada
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[3.5rem] border-none shadow-2xl p-14">
              <AlertDialogHeader>
                <div className="mx-auto bg-destructive/10 p-8 rounded-full mb-8 w-fit">
                  <Wallet className="w-16 h-16 text-destructive" />
                </div>
                <AlertDialogTitle className="text-4xl font-black text-center uppercase tracking-tighter">¿Cerrar el día?</AlertDialogTitle>
                <AlertDialogDescription className="text-xl text-center mt-6 font-medium leading-relaxed">
                  Todos los registros actuales serán borrados permanentemente. Asegúrate de haber guardado tu reporte antes de continuar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-6 mt-12">
                <AlertDialogCancel className="py-8 rounded-[2.5rem] flex-1 border-2 text-xl font-black uppercase">Volver</AlertDialogCancel>
                <AlertDialogAction onClick={clearDay} className="py-8 rounded-[2.5rem] flex-1 bg-destructive hover:bg-destructive/90 text-xl font-black uppercase shadow-2xl shadow-destructive/40">
                  Cerrar Día
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      {/* Dedicated Edit Screen (Dialog) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[3rem] border-none shadow-2xl p-12 max-w-lg w-[95%]">
          <DialogHeader>
            <div className="mx-auto bg-accent/10 p-6 rounded-full mb-6 w-fit">
              <Pencil className="w-12 h-12 text-accent" />
            </div>
            <DialogTitle className="text-4xl font-black text-center uppercase tracking-tighter">Editar Registro</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-8">
            <div className="space-y-3">
              <label className="text-xs font-black ml-1 text-muted-foreground uppercase tracking-widest">Nombre Cliente</label>
              <Input
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="text-2xl py-10 border-2 rounded-2xl font-bold bg-muted/20 px-6"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black ml-1 text-muted-foreground uppercase tracking-widest">Monto Correcto</label>
              <Input
                type="number"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="text-4xl py-12 border-2 rounded-2xl font-black text-primary text-center px-6"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-6">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="py-10 rounded-2xl flex-1 border-2 text-xl font-black uppercase"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate}
              className="py-10 rounded-2xl flex-1 bg-accent hover:bg-accent/90 text-xl font-black uppercase shadow-2xl shadow-accent/20"
            >
              <Check className="w-8 h-8 mr-2" />
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full mt-24 pb-16 text-center text-muted-foreground/30 no-print border-t border-muted/50 pt-12">
        <p className="text-2xl font-black uppercase tracking-[0.4em] text-primary/20">Monto Fácil</p>
        <p className="text-xs mt-3 font-black uppercase tracking-widest opacity-30">Diseño Moderno &bull; Eficiencia Total</p>
      </footer>
    </div>
  );
}