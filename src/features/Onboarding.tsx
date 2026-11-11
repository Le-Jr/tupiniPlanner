import React, { useState } from "react";
import { View } from "react-native";
import {
  AppCard,
  AppText,
  Brand,
  Button,
  Field,
  IconTile,
  ProgressBar,
  Screen,
  Toggle,
  styles,
} from "../components/ui";
import { categoryColors, colors as c } from "../theme/tokens";
import { useApp, uuid } from "./AppProvider";
import { seedPlan } from "../domain/seed";
import { materialize } from "../domain/planner";
import { numberInput } from "../utils/input";
export function Onboarding() {
  const { run, mutate, today, busy } = useApp();
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [sleep, setSleep] = useState("");
  const [activity, setActivity] = useState("");
  const [limits, setLimits] = useState("");
  const [meals, setMeals] = useState("");
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(false);
  const [baseline, setBaseline] = useState(false);
  const [weight, setWeight] = useState("96,9");
  const [goal, setGoal] = useState("92,1");
  const start = () =>
    run(async () => {
      if (!consent)
        throw new Error(
          "Autorize o armazenamento local para começar. Dados pessoais são opcionais.",
        );
      const heightCm = numberInput(height, 80, 250, "Altura", true);
      const weightKg = baseline
        ? numberInput(weight, 20, 400, "Peso")!
        : undefined;
      const target = baseline
        ? numberInput(goal, 20, 400, "Meta", true)
        : undefined;
      await mutate((s) => {
        const now = new Date().toISOString();
        s.profiles = [
          {
            id: uuid(),
            displayName: name.trim(),
            heightCm,
            createdAt: now,
            consentAt: now,
            onboardingCompleted: true,
            sleepRoutine: sleep.trim(),
            activityLevel: activity.trim(),
            limitations: limits.trim(),
            mealRoutine: meals.trim(),
          },
        ];
        if (baseline) {
          s.baselines.push({
            id: uuid(),
            measuredAt: "2026-11-10",
            weightKg: weightKg!,
            bodyFatPercent: 37,
            leanMassKg: 61,
            visceralIndex: 15,
            source: "Baseline sugerida no PRD; confirmada no onboarding",
            notes: "Estimativas de bioimpedância, não diagnóstico.",
          });
          s.measurements.push({
            id: uuid(),
            date: "2026-11-10",
            weightKg,
            bodyFatPercent: 37,
            measurementMethod: "Bioimpedância",
          });
          if (target)
            s.goals.push({
              id: uuid(),
              category: "body",
              title: "Referência de peso",
              targetValue: target,
              unit: "kg",
              active: true,
              createdAt: now,
            });
        }
        if (plan) seedPlan(s, today, uuid);
        materialize(s, today, uuid);
        s.settings[0]!.lastAgendaDate = today;
      });
    });
  const steps = ["Boas-vindas", "Sobre você", "Seu plano"];
  const last = step === steps.length - 1;
  return (
    <Screen>
      <View
        style={[
          styles.row,
          { justifyContent: "space-between", flexWrap: "nowrap" },
        ]}
      >
        <Brand />
        <AppText variant="micro" tone="subtle">
          {String(step + 1).padStart(2, "0")}/
          {String(steps.length).padStart(2, "0")}
        </AppText>
      </View>
      <View style={{ gap: 8 }}>
        <ProgressBar
          value={step + 1}
          total={steps.length}
          segments={steps.length}
          height={4}
        />
        <AppText variant="micro" tone="green">
          {"> "}
          {steps[step]!.toUpperCase()}
        </AppText>
      </View>

      {step === 0 && (
        <>
          <AppCard
            variant="hero"
            corners
            style={{ paddingVertical: 28, gap: 16 }}
          >
            <AppText variant="micro" tone="accent">
              SUA NOVA CAMPANHA // 01
            </AppText>
            <AppText variant="title" style={{ fontSize: 34, lineHeight: 41 }}>
              Missões pequenas.{"\n"}
              <AppText
                variant="title"
                tone="green"
                style={{ fontSize: 34, lineHeight: 41 }}
              >
                Mudanças gigantes.
              </AppText>
            </AppText>
            <AppText tone="muted">
              Um lugar para se movimentar, organizar refeições e dar vida ao
              próximo riff. No seu ritmo.
            </AppText>
          </AppCard>
          {(
            [
              {
                icon: "fitness",
                color: categoryColors.movement,
                t: "Movimento gradual",
                d: "Caminhadas e calistenia leve, sem progressão forçada.",
              },
              {
                icon: "restaurant",
                color: categoryColors.meal,
                t: "Rotina alimentar",
                d: "Regularidade e observação. Sem contar calorias.",
              },
              {
                icon: "musical-notes",
                color: categoryColors.guitar,
                t: "Guitarra",
                d: "Timer de prática e meta semanal flexível.",
              },
              {
                icon: "lock-closed",
                color: c.muted,
                t: "100% local",
                d: "Sem conta, sem analytics. Exporte ou apague quando quiser.",
              },
            ] as const
          ).map((f) => (
            <View
              key={f.t}
              style={[styles.row, { flexWrap: "nowrap", gap: 14 }]}
            >
              <IconTile icon={f.icon} color={f.color} />
              <View style={{ flex: 1 }}>
                <AppText variant="label">{f.t}</AppText>
                <AppText variant="small" tone="subtle">
                  {f.d}
                </AppText>
              </View>
            </View>
          ))}
        </>
      )}

      {step === 1 && (
        <AppCard>
          <AppText variant="heading">Como quer ser chamado?</AppText>
          <AppText variant="small" tone="subtle">
            Tudo opcional. Deixe em branco o que não quiser informar.
          </AppText>
          <Field
            label="Seu nome"
            value={name}
            onChangeText={setName}
            maxLength={80}
            placeholder="Como prefere ser chamado"
          />
          <Field
            label="Altura em cm"
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            placeholder="Ex.: 170"
          />
          <Field
            label="Sono e horários"
            value={sleep}
            onChangeText={setSleep}
            placeholder="Como anda sua rotina?"
          />
          <Field
            label="Atividade atual"
            value={activity}
            onChangeText={setActivity}
            placeholder="Ex.: caminho às vezes"
          />
          <Field
            label="Restrições físicas"
            value={limits}
            onChangeText={setLimits}
          />
          <Field
            label="Rotina alimentar"
            value={meals}
            onChangeText={setMeals}
          />
        </AppCard>
      )}

      {step === 2 && (
        <>
          <AppCard>
            <Toggle
              icon="map"
              label="Experimentar um plano sugerido"
              value={plan}
              onChange={setPlan}
              detail="Editável em Missões, sem progressão automática."
            />
            {plan && (
              <AppText variant="small" tone="muted">
                Calistenia seg/qui; caminhada ter/sex/sáb de 15 min; guitarra
                seg/qua/sex/sáb de 25 min; quatro lembretes de refeições com
                horários de exemplo. Você pode editar ou pausar cada sugestão.
              </AppText>
            )}
            <View style={{ height: 1, backgroundColor: c.line }} />
            <Toggle
              icon="analytics"
              label="Importar baseline sugerida"
              value={baseline}
              onChange={setBaseline}
              detail="Não é obrigatório acompanhar medidas."
            />
            {baseline && (
              <>
                <AppText variant="small" tone="muted">
                  10/11/2026 · gordura estimada 37%, massa livre estimada 61 kg,
                  índice visceral 15. Confirme apenas se estes dados forem seus.
                  Bioimpedância é uma estimativa.
                </AppText>
                <Field
                  label="Peso da baseline em kg"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
                <Field
                  label="Meta de referência em kg (opcional)"
                  value={goal}
                  onChangeText={setGoal}
                  keyboardType="decimal-pad"
                />
              </>
            )}
          </AppCard>
          <AppCard style={{ borderColor: consent ? `${c.primary}66` : c.line }}>
            <Toggle
              icon="shield-checkmark"
              label="Autorizo salvar os dados neste aparelho"
              value={consent}
              onChange={setConsent}
              detail="Sem conta, analytics ou envio à rede. Exporte ou apague em Perfil."
            />
          </AppCard>
        </>
      )}

      <View style={[styles.row, { flexWrap: "nowrap" }]}>
        {step > 0 && (
          <Button
            title="Voltar"
            secondary
            icon="arrow-back"
            onPress={() => setStep(step - 1)}
            style={{ flex: 1 }}
          />
        )}
        <Button
          title={
            last ? "COMEÇAR CAMPANHA" : step === 0 ? "VAMOS LÁ" : "CONTINUAR"
          }
          icon={last ? "rocket" : "arrow-forward"}
          size="lg"
          onPress={last ? start : () => setStep(step + 1)}
          disabled={last && (!consent || busy)}
          loading={last && busy}
          style={{ flex: 2 }}
        />
      </View>
      {last && !consent && (
        <AppText variant="small" tone="subtle" style={{ textAlign: "center" }}>
          Ative a autorização acima para começar.
        </AppText>
      )}
    </Screen>
  );
}
