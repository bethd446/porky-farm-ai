import { motion } from 'framer-motion';
import { ArrowRight, Leaf, TrendingUp, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { pageTransition } from '@/lib/animations';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Leaf,
      title: 'Suivi Intelligent',
      description: 'Suivez chaque porc de la naissance à la vente avec photos, poids et historique médical complet',
    },
    {
      icon: TrendingUp,
      title: 'Formulation IA',
      description: 'Générez des formules alimentaires optimales adaptées aux matières premières locales',
    },
    {
      icon: Shield,
      title: 'Gestion Complète',
      description: 'Finances, calendrier, événements : tout centralisé dans une seule application',
    },
  ];

  const benefits = [
    'Suivi en temps réel de tous vos porcs',
    'Formulation alimentaire optimisée par IA',
    'Gestion financière complète',
    'Calendrier des événements et rappels',
    'Rapports détaillés et statistiques',
    'Application mobile responsive',
  ];

  return (
    <motion.div className="min-h-screen" {...pageTransition}>
      {/* Hero Section - Photo Immersive */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image avec fallback gradient */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-green-900 via-green-800 to-green-900" />
          {/* Pattern overlay pour texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                PorcPro
              </h1>
            </motion.div>
            <p className="text-2xl md:text-3xl mb-8 text-green-50 font-medium">
              Gérez votre élevage porcin avec intelligence
            </p>
            <p className="text-lg md:text-xl mb-12 text-green-100 max-w-2xl mx-auto leading-relaxed">
              La solution complète pour les éleveurs modernes d'Afrique de l'Ouest.{' '}
              Suivi des porcs, formulation IA, gestion financière.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-white text-green-900 hover:bg-green-50 text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto font-semibold backdrop-blur-sm"
              >
                Voir la démo
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Une solution complète pour moderniser votre élevage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi choisir PorcPro ?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Une application conçue spécifiquement pour les éleveurs porcins
                d'Afrique de l'Ouest, avec toutes les fonctionnalités dont vous
                avez besoin.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
              <p className="text-green-50 mb-6">
                Rejoignez les éleveurs qui ont déjà transformé leur gestion
                avec PorcPro.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-white text-green-900 hover:bg-green-50 w-full"
                size="lg"
              >
                Créer un compte gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à moderniser votre élevage ?
            </h2>
            <p className="text-xl mb-8 text-green-50">
              Rejoignez les éleveurs qui ont déjà transformé leur gestion
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white text-green-900 hover:bg-green-50 text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

