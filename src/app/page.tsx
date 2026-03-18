"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Send, FileText, Trash2, Wallet, User, DollarSign, Pencil, Check, ReceiptText, Sparkles } from 'lucide-react';
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

  const formatCurrencyInput = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 2 ? parts[0] + '.' + parts[1] : parts.join('.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setAmount(formatted);
  };

  const handleEditAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setEditAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount) return;

    const numericAmount = parseFloat(amount.replace(/,/g, ''));

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: clientName.trim(),
      amount: numericAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPayments([...payments, newPayment]);
    setClientName('');
    setAmount('');
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setEditClientName(payment.clientName);
    setEditAmount(payment.amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }));
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingPayment || !editClientName.trim() || !editAmount) return;

    const numericAmount = parseFloat(editAmount.replace(/,/g, ''));

    setPayments(payments.map(p => 
      p.id === editingPayment.id 
        ? { ...p, clientName: editClientName.trim(), amount: numericAmount } 
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
    const list = payments.map(p => `- ${p.clientName}: $${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`).join('\n');
    const text = `*CIERRE DE DÍA - ${date}*\n\n*Detalle de Cobros:*\n${list}\n\n*TOTAL DEL DÍA: $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}*`;
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
      <header className="w-full max-w-2xl mb-8 md:mb-12 flex flex-col items-center text-center no-print">
        <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tighter uppercase italic leading-none drop-shadow-sm">Monto Fácil</h1>
        <div className="bg-accent px-4 py-1.5 md:px-6 md:py-2 rounded-full mt-4 shadow-lg shadow-accent/20">
          <p className="text-accent-foreground text-[10px] md:text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles className="w-3 h-3 md:w-4 h-4" />
            Control Financiero Total
          </p>
        </div>
      </header>

      <main className="w-full max-w-2xl space-y-6 md:space-y-10">
        {/* Formulario de Entrada */}
        <Card className="no-print border-none shadow-[0_30px_70px_-20px_rgba(0,0,0,0.15)] bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/5 py-6 md:py-8">
            <CardTitle className="text-2xl md:text-3xl font-black flex items-center gap-3 uppercase text-primary tracking-tight">
              <Plus className="w-8 h-8 md:w-10 h-10 text-primary" />
              Nuevo Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-6 md:pt-10 md:px-10">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:gap-10">
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] md:text-sm font-black flex items-center gap-2 ml-1 text-muted-foreground uppercase tracking-[0.2em]">
                  <User className="w-4 h-4 md:w-5 h-5 text-primary" />
                  Nombre del Cliente
                </label>
                <Input
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="!text-3xl md:!text-5xl h-auto py-8 md:py-12 border-2 bg-secondary/30 focus:bg-white focus:border-primary transition-all rounded-[1rem] md:rounded-[1.5rem] placeholder:text-muted-foreground/20 font-black px-6 md:px-8 shadow-inner uppercase"
                  required
                />
              </div>
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] md:text-sm font-black flex items-center gap-2 ml-1 text-muted-foreground uppercase tracking-[0.2em]">
                  <DollarSign className="w-4 h-4 md:w-5 h-5 text-primary" />
                  Monto Cobrado
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    className="!text-5xl md:!text-8xl h-auto py-10 md:py-14 border-2 bg-secondary/30 focus:bg-white focus:border-primary transition-all rounded-[1rem] md:rounded-[1.5rem] font-black text-primary text-center px-6 md:px-8 shadow-inner"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-auto py-8 md:py-12 text-2xl md:text-4xl font-black rounded-[1rem] md:rounded-[1.5rem] bg-primary hover:bg-primary/90 shadow-[0_15px_40px_-10px_rgba(37,99,235,0.4)] transition-all active:scale-95 uppercase tracking-widest">
                Registrar Pago
              </Button>
            </form>
          </CardContent>
          <div className="h-4 md:h-6 bg-accent/20"></div>
        </Card>

        {/* Cuadro de Total */}
        <Card className="bg-primary text-white overflow-hidden border-none shadow-[0_25px_60px_-15px_rgba(37,99,235,0.4)] relative rounded-[1.5rem] md:rounded-[2.5rem]">
          <CardContent className="p-4 md:p-6 text-center flex flex-col items-center relative z-10">
            <span className="text-white/60 text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black mb-1">Total Recaudado Hoy</span>
            <div className="text-4xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-2xl">
              ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 px-4 py-1 bg-accent rounded-full text-accent-foreground text-[8px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20">
              {payments.length} Cobros registrados
            </div>
          </CardContent>
        </Card>

        {/* Historial de Cobros */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2rem] md:rounded-[3rem]">
          <CardHeader className="border-b-2 border-secondary bg-secondary/30 py-6 px-6 md:py-8 md:px-10">
            <CardTitle className="text-xl md:text-2xl font-black flex items-center gap-3 uppercase tracking-tight text-primary">
              <ReceiptText className="w-6 h-6 md:w-8 h-8" />
              Historial de Cobros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-secondary/40 border-b-2">
                  <TableHead className="font-black text-[10px] md:text-xs py-4 md:py-6 pl-6 md:pl-10 uppercase text-muted-foreground tracking-[0.2em]">Cliente</TableHead>
                  <TableHead className="font-black text-[10px] md:text-xs py-4 md:py-6 text-right uppercase text-muted-foreground tracking-[0.2em]">Monto</TableHead>
                  <TableHead className="font-black text-[10px] md:text-xs py-4 md:py-6 text-center pr-6 md:pr-10 uppercase no-print text-muted-foreground tracking-[0.2em] w-24 md:w-36">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-60 md:h-80 text-center text-muted-foreground/30 text-2xl md:text-3xl italic font-black uppercase">
                      Vacio
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="group transition-colors hover:bg-secondary/20 border-b-2 border-secondary/50">
                      <TableCell className="py-6 md:py-10 pl-6 md:pl-10">
                        <div className="flex flex-col">
                          <span className="text-lg md:text-2xl font-black text-foreground uppercase tracking-tight leading-tight">{p.clientName}</span>
                          <span className="text-[10px] md:text-sm text-primary font-bold mt-1 no-print opacity-80 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 md:w-4 h-4" />
                            {p.timestamp}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 md:py-10 text-right">
                        <span className="text-2xl md:text-5xl font-black text-primary tabular-nums tracking-tighter drop-shadow-sm">
                          ${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 md:py-10 pr-6 md:pr-10 text-right no-print">
                        <div className="flex justify-end gap-2 md:gap-5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditDialog(p)}
                            className="text-primary hover:bg-primary hover:text-white rounded-[0.8rem] md:rounded-[1.2rem] h-10 w-10 md:h-16 md:w-16 border-2 md:border-4 border-primary/10 transition-all shadow-md active:scale-90"
                          >
                            <Pencil className="w-5 h-5 md:w-8 h-8" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:bg-destructive hover:text-white rounded-[0.8rem] md:rounded-[1.2rem] h-10 w-10 md:h-16 md:w-16 border-2 md:border-4 border-destructive/10 transition-all shadow-md active:scale-90"
                              >
                                <Trash2 className="w-5 h-5 md:w-8 h-8" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem] md:rounded-[4rem] border-none shadow-[0_40px_100px_-20px_rgba(239,68,68,0.3)] p-8 md:p-14 w-[90vw] md:w-full max-w-lg">
                              <AlertDialogHeader>
                                <div className="mx-auto bg-destructive/10 p-6 md:p-8 rounded-full mb-6 md:mb-8 w-fit">
                                  <Trash2 className="w-10 h-10 md:w-16 md:w-16 text-destructive" />
                                </div>
                                <AlertDialogTitle className="text-2xl md:text-4xl font-black text-center uppercase tracking-tighter">¿Borrar registro?</AlertDialogTitle>
                                <AlertDialogDescription className="text-lg md:text-2xl text-center mt-4 font-medium">
                                  Vas a eliminar el cobro de <span className="font-black text-foreground underline decoration-destructive decoration-4">{p.clientName}</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-10 md:mt-14">
                                <AlertDialogCancel className="py-6 md:py-10 rounded-[1rem] md:rounded-[2rem] flex-1 border-2 md:border-4 text-lg md:text-2xl font-black uppercase transition-all hover:bg-secondary">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePayment(p.id)} className="py-6 md:py-10 rounded-[1rem] md:rounded-[2rem] flex-1 bg-destructive hover:bg-destructive/90 text-lg md:text-2xl font-black uppercase shadow-2xl shadow-destructive/40">
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
          <CardFooter className="flex flex-col sm:flex-row gap-4 md:gap-8 p-8 md:p-14 bg-secondary/10 no-print border-t-4 border-secondary/20 justify-center">
            <Button 
              onClick={shareSummary} 
              disabled={payments.length === 0}
              variant="outline" 
              className="w-full sm:w-auto py-8 md:py-12 px-8 md:px-14 border-2 md:border-4 border-primary/20 hover:border-primary hover:bg-primary/5 text-xl md:text-3xl font-black text-primary rounded-[1rem] md:rounded-[1.5rem] uppercase flex items-center justify-center min-w-full sm:min-w-[280px] shadow-2xl shadow-primary/5 transition-all active:scale-95"
            >
              <Send className="w-8 h-8 md:w-10 h-10 mr-3 md:mr-4" />
              WhatsApp
            </Button>
            <Button 
              onClick={exportPDF} 
              disabled={payments.length === 0}
              variant="outline" 
              className="w-full sm:w-auto py-8 md:py-12 px-8 md:px-14 border-2 md:border-4 border-accent/40 hover:border-accent hover:bg-accent/5 text-xl md:text-3xl font-black text-accent-foreground rounded-[1rem] md:rounded-[1.5rem] uppercase flex items-center justify-center min-w-full sm:min-w-[280px] shadow-2xl shadow-accent/5 transition-all active:scale-95"
            >
              <FileText className="w-8 h-8 md:w-10 h-10 mr-3 md:mr-4 text-accent" />
              Reporte
            </Button>
          </CardFooter>
        </Card>

        {/* Acción de Reiniciar */}
        <div className="flex justify-center pt-6 md:pt-10 no-print">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-2 md:border-4 border-destructive text-destructive bg-white hover:bg-destructive hover:text-white py-6 md:py-10 px-8 md:px-16 rounded-[1.5rem] md:rounded-[2.5rem] text-[10px] md:text-sm font-black uppercase tracking-[0.4em] transition-all shadow-xl shadow-destructive/10"
                disabled={payments.length === 0}
              >
                <Trash2 className="w-5 h-5 md:w-6 h-6 mr-3 md:mr-4" />
                Reiniciar Jornada
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] md:rounded-[4.5rem] border-none shadow-[0_50px_120px_-30px_rgba(0,0,0,0.3)] p-10 md:p-16 w-[90vw] md:w-full max-w-lg">
              <AlertDialogHeader>
                <div className="mx-auto bg-primary/10 p-6 md:p-10 rounded-full mb-6 md:mb-10 w-fit">
                  <Wallet className="w-12 h-12 md:w-20 md:w-20 text-primary" />
                </div>
                <AlertDialogTitle className="text-3xl md:text-5xl font-black text-center uppercase tracking-tighter">¿Cerrar el día?</AlertDialogTitle>
                <AlertDialogDescription className="text-lg md:text-2xl text-center mt-6 md:mt-8 font-medium leading-relaxed">
                  Se borrarán todos los registros. ¿Guardaste tu reporte?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 md:gap-8 mt-10 md:mt-16">
                <AlertDialogCancel className="py-6 md:py-10 rounded-[1.5rem] md:rounded-[2.5rem] flex-1 border-2 md:border-4 text-lg md:text-2xl font-black uppercase">Volver</AlertDialogCancel>
                <AlertDialogAction onClick={clearDay} className="py-6 md:py-10 rounded-[1.5rem] md:rounded-[2.5rem] flex-1 bg-primary hover:bg-primary/90 text-lg md:text-2xl font-black uppercase shadow-2xl shadow-primary/40">
                  Cerrar Día
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      {/* Pantalla de Edición Dedicada */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2rem] md:rounded-[3.5rem] border-none shadow-3xl p-8 md:p-14 max-w-lg w-[90vw] bg-white">
          <DialogHeader>
            <div className="mx-auto bg-accent/10 p-6 md:p-8 rounded-full mb-6 md:mb-8 w-fit">
              <Pencil className="w-10 h-10 md:w-16 md:w-16 text-accent" />
            </div>
            <DialogTitle className="text-3xl md:text-5xl font-black text-center uppercase tracking-tighter">Corregir</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 md:space-y-10 py-6 md:py-10">
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] md:text-sm font-black ml-1 text-muted-foreground uppercase tracking-widest">Nombre Cliente</label>
              <Input
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="!text-3xl md:!text-5xl h-auto py-6 md:py-10 border-2 md:border-4 rounded-[1rem] md:rounded-[1.5rem] font-black bg-secondary/30 px-6 md:px-8 focus:border-accent uppercase"
              />
            </div>
            <div className="space-y-3 md:space-y-4">
              <label className="text-[10px] md:text-sm font-black ml-1 text-muted-foreground uppercase tracking-widest">Monto Correcto</label>
              <Input
                type="text"
                inputMode="decimal"
                value={editAmount}
                onChange={handleEditAmountChange}
                className="!text-5xl md:!text-8xl h-auto py-8 md:py-12 border-2 md:border-4 rounded-[1rem] md:rounded-[1.5rem] font-black text-primary text-center px-6 md:px-8 bg-secondary/30 focus:border-accent"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-4 md:gap-8">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="py-8 md:py-12 rounded-[1rem] md:rounded-[1.5rem] flex-1 border-2 md:border-4 text-xl md:text-2xl font-black uppercase"
            >
              Salir
            </Button>
            <Button 
              onClick={handleUpdate}
              className="py-8 md:py-12 rounded-[1rem] md:rounded-[1.5rem] flex-1 bg-accent hover:bg-accent/90 text-xl md:text-2xl font-black uppercase shadow-2xl shadow-accent/40"
            >
              <Check className="w-8 h-8 md:w-10 md:w-10 mr-3" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full mt-16 md:mt-32 pb-10 md:pb-20 text-center text-muted-foreground/20 no-print border-t-2 md:border-t-4 border-secondary/30 pt-10 md:pt-16">
        <p className="text-xl md:text-3xl font-black uppercase tracking-[0.5em] text-primary/30">Monto Fácil</p>
        <p className="text-[10px] md:text-sm mt-3 md:mt-5 font-black uppercase tracking-widest opacity-40">Pro Edition &bull; 2024</p>
      </footer>
    </div>
  );
}
