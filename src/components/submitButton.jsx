const SubmitButton = ({ message }) => {
  return (
    <div className="flex mt-2">
      <Button disabled={submitting} onClick={handleSubmit}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
      {message.text && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default SubmitButton;
