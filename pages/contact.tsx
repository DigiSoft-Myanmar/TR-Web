import Navbar from "@/components/navbar/Navbar";
import FormInput from "@/components/presentational/FormInput";

import { defaultDescription } from "@/types/const";
import Head from "next/head";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import nextI18nextConfig from "@/next-i18next.config";

const schema = z.object({
  name: z.string().email({ message: "Please input valid email address." }),
});

type Contact = {
  name?: string;
};

function Contact() {
  const [defaultValue, setDefaultValue] = React.useState<Contact>({});
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Contact>({
    mode: "onChange",
    defaultValues: defaultValue,
    resolver: zodResolver(schema),
  });
  const watchFields = watch();

  const onSubmit = (data: any) => {
    return console.log(data);
  };

  return (
    <div>
      <Head>
        <title>Contact | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="flex flex-col space-y-5">
            <FormInput
              label="Name"
              placeHolder="Enter Name"
              error={errors.name?.message}
              type="text"
              defaultValue={defaultValue.name}
              formControl={{ ...register("name") }}
              currentValue={watchFields.name}
            />
          </section>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Contact;
