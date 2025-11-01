"use client";
import { ContactCard } from "./ContactCard";
import { Section } from "./Section";
import { motion } from "framer-motion";
import { useIntlayer } from "next-intlayer";

export const Contact = () => {
  const content = useIntlayer("contact");

  return (
    <Section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-br from-muted/30 via-background to-muted/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {content.badge.value}
          </motion.div>
          <motion.h2
            className="text-4xl lg:text-5xl font-bold bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {content.title.value}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {content.description.value}
          </motion.p>
        </motion.div>

        {/* Contact Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
          >
            <ContactCard
              className="h-full"
              url="https://www.linkedin.com/in/fernandsoualo/"
              name="@fernandsoualo"
              description="Follow me on LinkedIn"
              image="/linkedin_profile_photo.jpeg"
              mediumImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRokEYt0yyh6uNDKL8uksVLlhZ35laKNQgZ9g&s"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
          >
            <ContactCard
              className="h-full"
              url="https://github.com/fygs"
              name="@fygsdev"
              description="Follow me on GitHub"
              image="https://avatars.githubusercontent.com/u/24303747?v=4"
              mediumImage="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
          >
            <ContactCard
              className="h-full"
              url="mailto:fygs.dev@gmail.com"
              name="me@contact.com"
              description="Email me for any inquiries"
              image="https://lh3.googleusercontent.com/a/ACg8ocIMjYoOFbL2_xkgKy1N14BS3AvMok9pZfr_Qj9W03TOiJNCGw1=s83-c-mo"
              mediumImage="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/640px-Gmail_icon_%282020%29.svg.png"
            />
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
};
