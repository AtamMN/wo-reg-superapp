// components/GuestBook/SignaturePad.jsx
import { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../ui/button';

export default function SignaturePad({ onSignatureChange }) {
  const sigCanvas = useRef();

  const handleClear = () => {
    sigCanvas.current.clear();
    onSignatureChange(false);
  };

  return (
    <div>
      <p className="mb-1 font-medium">Signature</p>
      <SignatureCanvas
        penColor="black"
        canvasProps={{
          width: 500,
          height: 200,
          className: "border rounded bg-white",
        }}
        ref={sigCanvas}
        onEnd={() => onSignatureChange(!sigCanvas.current.isEmpty())}
      />
      <Button
        variant="outline"
        className="mt-2"
        onClick={handleClear}
      >
        Clear
      </Button>
    </div>
  );
}