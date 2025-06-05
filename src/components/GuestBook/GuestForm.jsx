// components/GuestBook/GuestForm.jsx
import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function GuestForm({ onSubmit, submitting, validator }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState(null);
  const sigCanvas = useRef();
  const containerRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(500);

  // Update canvas width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Clear form when submission completes
  useEffect(() => {
    if (!submitting) {
      setName('');
      setPhone('');
      setAddress('');
      sigCanvas.current?.clear();
      setSignature(null);
    }
  }, [submitting]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!signature) {
      alert('Please provide a signature');
      return;
    }
    
    onSubmit({ 
      name, 
      phone, 
      address,
      signature,
      validator: validator?.email || '-'
    });
  };

  const handleSignatureEnd = () => {
    setSignature(sigCanvas.current.toDataURL());
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignature(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <Textarea
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />

      <div ref={containerRef}>
        <p className="mb-1 font-medium">Signature</p>
        <SignatureCanvas
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: 200,
            className: "border rounded bg-white w-full",
          }}
          ref={sigCanvas}
          onEnd={handleSignatureEnd}
        />
        {signature && (
          <Button
            variant="outline"
            className="mt-2"
            onClick={clearSignature}
            type="button"
          >
            Clear Signature
          </Button>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}