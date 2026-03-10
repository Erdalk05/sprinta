import { useLocalSearchParams } from 'expo-router'
import MockExamScreen from '../../src/screens/exam/MockExamScreen'

export default function ExamRoute() {
  const { examType, subject, count } = useLocalSearchParams<{
    examType: string
    subject?: string
    count?: string
  }>()

  return (
    <MockExamScreen
      examType={examType ?? 'LGS'}
      subject={subject}
      questionCount={count ? parseInt(count, 10) : 20}
    />
  )
}
