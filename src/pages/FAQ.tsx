import Navbar from "@/components/Navbar";

const FAQ = () => {
  const faqs = [
    {
      question: "What makes MyFuze water different?",
      answer: "MyFuze water undergoes a seven-stage artisanal purification process, combining traditional methods with cutting-edge technology to ensure 99.9% purity."
    },
    {
      question: "Where does MyFuze water come from?",
      answer: "Our water is hand-selected from the world's most pristine alpine springs, where nature has perfected purity for millennia."
    },
    {
      question: "Is MyFuze environmentally friendly?",
      answer: "Yes, we pioneer sustainable practices with carbon-negative operations and regenerative packaging to protect our planet."
    },
    {
      question: "How long does shipping take?",
      answer: "We offer complimentary white-glove delivery within 3-5 business days for most locations."
    },
    {
      question: "Do you offer a satisfaction guarantee?",
      answer: "Absolutely! We provide a 30-day satisfaction guarantee on all our products."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-6xl font-thin text-foreground tracking-tight">
              Frequently Asked Questions
            </h1>
            <div className="w-16 h-px bg-primary mx-auto"></div>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Find answers to common questions about MyFuze water products and services.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border/30 pb-8">
                <h3 className="text-xl font-medium text-foreground mb-4">{faq.question}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
