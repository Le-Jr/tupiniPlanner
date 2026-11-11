import React, { useState } from "react";
import {
  AppCard,
  AppText,
  Brand,
  Button,
  Field,
  Screen,
  Toggle,
} from "../components/ui";
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
  return (
    <Screen>
      <Brand />
      <AppText variant="micro" tone="green">
        SUA NOVA CAMPANHA // 01
      </AppText>
      <AppText variant="title">
        Missões pequenas.{"\n"}Mudanças gigantes.
      </AppText>
      <AppText tone="muted">
        Um lugar para se movimentar, organizar refeições e dar vida ao próximo
        riff. No seu ritmo.
      </AppText>
      <AppCard>
        <AppText variant="heading">Como começamos?</AppText>
        <Field
          label="Seu nome (opcional)"
          value={name}
          onChangeText={setName}
          maxLength={80}
          placeholder="Como quer ser chamado?"
        />
        <Field
          label="Altura em cm (opcional)"
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          placeholder="Ex.: 170"
        />
        <Field
          label="Sono e horários (opcional)"
          value={sleep}
          onChangeText={setSleep}
          placeholder="Como anda sua rotina?"
        />
        <Field
          label="Atividade atual (opcional)"
          value={activity}
          onChangeText={setActivity}
        />
        <Field
          label="Restrições físicas (opcional)"
          value={limits}
          onChangeText={setLimits}
        />
        <Field
          label="Rotina alimentar (opcional)"
          value={meals}
          onChangeText={setMeals}
        />
      </AppCard>
      <AppCard>
        <Toggle
          label="Experimentar um plano sugerido"
          value={plan}
          onChange={setPlan}
          detail="Editável em Missões, sem progressão automática."
        />
        {plan && (
          <AppText tone="muted">
            Calistenia seg/qui; caminhada ter/sex/sáb de 15 min; guitarra
            seg/qua/sex/sáb de 25 min; quatro lembretes de refeições com
            horários de exemplo. Você pode editar ou pausar cada sugestão.
          </AppText>
        )}
        <Toggle
          label="Importar baseline sugerida"
          value={baseline}
          onChange={setBaseline}
          detail="Não é obrigatório acompanhar medidas."
        />
        {baseline && (
          <>
            <AppText tone="muted">
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
      <Toggle
        label="Autorizo salvar os dados neste aparelho"
        value={consent}
        onChange={setConsent}
        detail="Sem conta, analytics ou envio à rede. Exporte ou apague em Perfil."
      />
      <Button
        title="COMEÇAR MINHA CAMPANHA"
        icon="arrow-forward-outline"
        onPress={start}
        disabled={!consent || busy}
      />
      <AppText tone="muted">
        Você pode deixar todos os campos pessoais vazios.
      </AppText>
    </Screen>
  );
}
