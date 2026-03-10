import { useLocalSearchParams } from 'expo-router'
import BossExamScreen from '../../src/screens/exam/BossExamScreen'

export default function BossExamRoute() {
  const { examType, subject } = useLocalSearchParams<{ examType: string; subject: string }>()
  return <BossExamScreen examType={examType ?? 'LGS'} subject={subject ?? 'Türkçe'} />
}
