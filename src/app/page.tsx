
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
        <div className="bg-primary rounded-full p-3 mb-4 shadow-lg shadow-primary/20">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-primary tracking-tight font-headline">Monto Fácil</h1>
        <p className="text-muted-foreground text-lg">Control diario de cobros</p>
      </header>

      {/* Printable Report Header */}
      <div className="print-only w-full max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center border-b pb-4 mb-4">REPORTE DIARIO DE COBROS</h1>
        <div className="flex justify-between text-lg font-medium">
          <p>Fecha: {new Date().toLocaleDateString()}</p>
          <p>Registros: {payments.length}</p>
        </div>
      </div>

      <main className="w-full max-w-2xl space-y-6">
        {/* Input Form */}
        <Card className="no-print border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" />
              Nuevo Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addPayment} className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5 ml-1">
                  <User className="w-4 h-4 text-primary" />
                  Nombre del Cliente
                </label>
                <Input
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-lg py-6 border-2 focus:border-primary transition-all rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5 ml-1">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Monto Entregado
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg py-6 border-2 focus:border-primary transition-all rounded-xl font-bold"
                  required
                />
              </div>
              <Button type="submit" className="w-full py-7 text-lg font-bold rounded-xl mt-2 bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                REGISTRAR PAGO
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Total Display */}
        <Card className="bg-primary text-white overflow-hidden border-none shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <CardContent className="p-8 text-center flex flex-col items-center">
            <span className="text-primary-foreground/80 text-lg uppercase tracking-widest font-bold mb-2">Total del Día</span>
            <div className="text-6xl font-black tabular-nums font-headline">
              ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 text-primary-foreground/70 font-medium">
              {payments.length} cobranzas realizadas hoy
            </div>
          </CardContent>
        </Card>

        {/* Payment List Table */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Detalle de Cobros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-base py-4 pl-6">Cliente</TableHead>
                  <TableHead className="font-bold text-base py-4 text-right pr-6">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-48 text-center text-muted-foreground text-lg italic">
                      No hay registros todavía
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="group transition-colors">
                      <TableCell className="py-5 pl-6 font-medium text-lg">
                        <div className="flex flex-col">
                          <span>{p.clientName}</span>
                          <span className="text-xs text-muted-foreground no-print">{p.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 pr-6 text-right text-xl font-bold text-primary">
                        ${p.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 p-6 bg-muted/10 no-print">
            <Button 
              onClick={shareSummary} 
              disabled={payments.length === 0}
              variant="outline" 
              className="flex-1 min-w-[140px] py-6 border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 font-semibold text-primary"
            >
              <Send className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            <Button 
              onClick={exportPDF} 
              disabled={payments.length === 0}
              variant="outline" 
              className="flex-1 min-w-[140px] py-6 border-2 border-accent/20 hover:border-accent/50 hover:bg-accent/5 font-semibold text-accent"
            >
              <FileText className="w-5 h-5 mr-2" />
              PDF / Imprimir
            </Button>
          </CardFooter>
        </Card>

        {/* Reset Action */}
        <div className="flex justify-center pt-4 no-print">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 py-6 px-8 rounded-xl font-medium"
                disabled={payments.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Pantalla (Cierre de Día)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-bold">¿Limpiar registros?</AlertDialogTitle>
                <AlertDialogDescription className="text-lg">
                  Se borrarán todos los datos de hoy. Asegúrate de haber compartido el resumen o guardado el reporte antes de continuar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-2">
                <AlertDialogCancel className="py-6 rounded-xl flex-1 border-2 font-semibold">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearDay} className="py-6 rounded-xl flex-1 bg-destructive hover:bg-destructive/90 font-semibold shadow-lg shadow-destructive/20">
                  Confirmar Borrado
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>

      <footer className="w-full mt-12 pb-8 text-center text-muted-foreground no-print">
        <p className="text-sm font-medium">Monto Fácil &copy; {new Date().getFullYear()}</p>
        <p className="text-xs mt-1">Herramienta rápida para cobradores eficientes</p>
      </footer>
    </div>
  );
}
