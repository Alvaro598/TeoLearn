import { useParams, useNavigate } from "react-router-dom";
import { exercisesData } from "../../data/exercisesData";
import { lessonsData } from "../../data/lessonData";

import RitmoExercise from "../components/ui/exercises/RitmoExercise";
import MelodiaExercise from "../components/ui/exercises/MelodiaExercise";
import ArmoniaExercise from "../components/ui/exercises/ArmoniaExercise";

export default function Ejercicio() {
  const { leccionId } = useParams();
  const navigate = useNavigate();

  const exercise = exercisesData[leccionId];

  // Find the moduleId for this lessonId
  let moduloId = null;
  for (const mod in lessonsData) {
    if (lessonsData[mod].some(lesson => lesson.id == leccionId)) {
      moduloId = mod;
      break;
    }
  }

  if (!exercise) return <p>No existe ejercicio</p>;

  return (
    <div>
      <button
        onClick={() => navigate(`/lecciones/${leccionId}`)}
        className="m-4 text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Volver
      </button>

      
      {exercise.type === "ritmo" && <RitmoExercise />}
      {exercise.type === "melodia" && <MelodiaExercise />}
      {exercise.type === "armonia" && <ArmoniaExercise />}
    </div>
  );
}