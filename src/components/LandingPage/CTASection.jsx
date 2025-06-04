import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner'; // using Sonner toaster for notifications
import { personalDb } from '@/lib/firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

//post to personal db
const CTASection = () => {
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (email) {
      setFormData(prev => ({ ...prev, email }));
      setDialogOpen(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(
        collection(personalDb, 'wo-reg-superapp-contacts'),
        formData
      );
      toast.success('Your contact has been saved.');
      // reset form and email
      setFormData({ name: '', email: '', message: '' });
      setEmail('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(error.message || 'Failed to save contact.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full py-12 md:py-24 lg:py-32 bg-slate-50"
    >
      <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-slate-900">
            Ready to Streamline Your Event Management?
          </h2>
          <p className="mx-auto max-w-[600px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Join thousands of organizations that trust WO-Reg to organize their events.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
          <form onSubmit={handleGetStarted} className="flex space-x-2">
            <div className="grid grid-cols-4 gap-4 w-full">
              <div className="col-span-3">
                <input
                  className="flex h-full w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Get Started'}
                </button>
              </div>
            </div>
          </form>
          <p className="text-xs text-slate-500">
            Start your free 14-day trial. No credit card required.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Get Started</DialogTitle>
              <DialogDescription>
                Fill in the details below and we'll be in touch soon.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default CTASection;