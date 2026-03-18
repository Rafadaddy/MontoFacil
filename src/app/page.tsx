
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Send, FileText, Trash2, Wallet, User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

  const addPayment = (e: React.FormEvent) => {
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
        <h1 className="text-5xl font-bold text-primary tracking-tight font-headline">Monto Fácil</h1>
        <p className="text-muted-foreground text-xl mt-2">Control diario de cobros</p>
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
        <Card className="no-print border-none shadow-2xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Plus className="w-6 h-6 text-accent" />
              Nuevo Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addPayment} className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <label className="text-lg font-semibold flex items-center gap-2 ml-1">
                  <User className="w-5 h-5 text-primary" />
                  Nombre del Cliente
                </label>
                <Input
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-xl py-8 border-2 focus:border-primary transition-all rounded-2xl placeholder:text-muted-foreground/50"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-lg font-semibold flex items-center gap-2 ml-1">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Monto Entregado
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl py-8 border-2 focus:border-primary transition-all rounded-2xl font-black text-primary"
                  required
                />
              </div>
              <Button type="submit" className="w-full py-9 text-2xl font-black rounded-2xl mt-4 bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 transition-transform active:scale-95 uppercase tracking-wide">
                Registrar Pago
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Total Display */}
        <Card className="bg-primary text-white overflow-hidden border-none shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Wallet className="w-24 h-24" />
          </div>
          <CardContent className="p-6 text-center flex flex-col items-center">
            <span className="text-primary-foreground/90 text-xl uppercase tracking-widest font-black mb-2">Total Acumulado</span>
            <div className="text-7xl font-black tabular-nums font-headline drop-shadow-md">
              ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 text-primary-foreground/80 text-lg font-bold">
              {payments.length} cobranzas hoy
            </div>
          </CardContent>
        </Card>

        {/* Payment List Table */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <CardHeader className="border-b-2 bg-muted/20 py-6">
            <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
              <Wallet className="w-6 h-6 text-primary" />
              Detalle de Cobros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/10">
                  <TableHead className="font-black text-lg py-5 pl-8 uppercase">Cliente</TableHead>
                  <TableHead className="font-black text-lg py-5 text-right pr-8 uppercase">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-64 text-center text-muted-foreground text-2xl italic font-medium">
                      No hay registros todavía
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="group transition-colors hover:bg-muted/5 border-b">
                      <TableCell className="py-6 pl-8">
                        <div className="flex flex-col">
                          <span className="text-xl font-bold text-foreground">{p.clientName}</span>
                          <span className="text-sm text-muted-foreground font-medium no-print">{p.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 pr-8 text-right">
                        <span className="text-2xl font-black text-primary">
                          ${p.amount.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4 p-8 bg-muted/5 no-print">
            <Button 
              onClick={shareSummary} 
              disabled={payments.length === 0}
              variant="outline" 
              className="flex-1 min-w-[180px] py-8 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-xl font-bold text-primary rounded-2xl"
            >
              <Send className="w-6 h-6 mr-3" />
              WhatsApp
            </Button>
            <Button 
              onClick={exportPDF} 
              disabled={payments.length === 0}
              variant="outline" 
              className="flex-1 min-w-[180px] py-8 border-2 border-accent/30 hover:border-accent hover:bg-accent/5 text-xl font-bold text-accent rounded-2xl"
            >
              <FileText className="w-6 h-6 mr-3" />
              Imprimir
            </Button>
          </CardFooter>
        </Card>

        {/* Reset Action */}
        <div className="flex justify-center pt-6 no-print">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 py-7 px-10 rounded-2xl text-lg font-bold"
                disabled={payments.length === 0}
              >
                <Trash2 className="w-5 h-5 mr-3" />
                Limpiar Cierre de Día
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-3xl font-black text-center">¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className="text-xl text-center mt-2">
                  Se borrarán todos los datos registrados. Asegúrate de haber compartido el resumen antes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                <AlertDialogCancel className="py-7 rounded-2xl flex-1 border-2 text-xl font-bold">Volver</AlertDialogCancel>
                <AlertDialogAction onClick={clearDay} className="py-7 rounded-2xl flex-1 bg-destructive hover:bg-destructive/90 text-xl font-bold shadow-lg shadow-destructive/20">
                  Sí, borrar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      <footer className="w-full mt-16 pb-12 text-center text-muted-foreground no-print border-t pt-8">
        <p className="text-lg font-bold">Monto Fácil &copy; {new Date().getFullYear()}</p>
        <p className="text-sm mt-2 font-medium">Diseñado para la eficiencia en campo</p>
      </footer>
    </div>
  );
}
