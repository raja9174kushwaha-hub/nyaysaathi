import React from 'react'
import SectionDivider from '../section-divider'
import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const HeroPage = () => {
  return (
    <>
      <section
        className="flex flex-col gap-8 md:gap-4 sm:items-center sm:justify-center font-semibold w-full min-h-screen mx-8 scroll-mt-12"
        id="about"
      >
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6 w-full mt-24">
          <div className="flex flex-col gap-4 max-w-[480px]">
            <h2 className="text-3xl md:text-4xl mb-12 md:mb-4">
              Do you have{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500 tracking-wide">
                legal problems
              </span>
              {' '}that need to be solved?
            </h2>
            <h3 className="text-2xl md:text-3xl brightness-50 font-normal">
              Here is one of the best AI assistants for legal matters!
              Our services will help you solve problems with complaints, appeals
              before court proceedings and contracts!
            </h3>
          </div>
          <Accordion
            type="single"
            collapsible
            className="w-10/12 sm:w-8/12 md:w-3/12"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger>What is AI-Lawyer?</AccordionTrigger>
              <AccordionContent>
                AI-Lawyer is a service that generates documents based on
                user inputs and provides legal advice. It is completely
                free and fast.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does AI-Lawyer work?</AccordionTrigger>
              <AccordionContent>
                AI-Lawyer uses artificial intelligence to analyze your input
                data and generates legal documents according to your needs. Additionally,
                it provides legal advice based on current laws and
                regulations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is AI-Lawyer free?</AccordionTrigger>
              <AccordionContent>
                Yes, AI-Lawyer is completely free. Our goal is to provide
                fast and accessible legal services for everyone.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                What types of documents can I generate?
              </AccordionTrigger>
              <AccordionContent>
                You can generate two types of legal documents: Lawsuits and
                Pre-litigation appeals.{' '}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                What is the accuracy of AI-Lawyer's legal advice?
              </AccordionTrigger>
              <AccordionContent>
                AI-Lawyer strives to provide the most accurate legal advice.
                However, we recommend consulting with a real lawyer for
                specific and complex legal matters.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <Image
          src="/chatbot.svg"
          width={500}
          height={500}
          className="opacity-95 h-[300px] w-[300px] lg:w-[400px] lg:h-[400px]"
          alt="Judge illustration"
        />
      </section>
      <SectionDivider />
    </>
  )
}

export default HeroPage
