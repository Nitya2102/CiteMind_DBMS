import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, BookOpen, Award } from "lucide-react";

const topicTrendData = [
  { year: '2020', ML: 245, NLP: 189, CV: 167, Robotics: 98 },
  { year: '2021', ML: 298, NLP: 234, CV: 203, Robotics: 112 },
  { year: '2022', ML: 356, NLP: 289, CV: 245, Robotics: 134 },
  { year: '2023', ML: 423, NLP: 345, CV: 298, Robotics: 156 },
  { year: '2024', ML: 487, NLP: 398, CV: 334, Robotics: 178 },
];

const authorInfluenceData = [
  { name: 'Yoshua Bengio', score: 2847 },
  { name: 'Geoffrey Hinton', score: 2654 },
  { name: 'Yann LeCun', score: 2498 },
  { name: 'Andrew Ng', score: 2234 },
  { name: 'Fei-Fei Li', score: 2123 },
];

const publicationDistribution = [
  { name: 'NeurIPS', value: 1234, color: 'hsl(var(--chart-1))' },
  { name: 'ICML', value: 987, color: 'hsl(var(--chart-2))' },
  { name: 'CVPR', value: 876, color: 'hsl(var(--chart-3))' },
  { name: 'ACL', value: 765, color: 'hsl(var(--chart-4))' },
  { name: 'Others', value: 2345, color: 'hsl(var(--chart-5))' },
];

const statCards = [
  { title: 'Total Papers', value: '24,567', icon: BookOpen, trend: '+12%' },
  { title: 'Active Researchers', value: '8,943', icon: Users, trend: '+8%' },
  { title: 'Citation Count', value: '156K', icon: TrendingUp, trend: '+23%' },
  { title: 'Top Venues', value: '142', icon: Award, trend: '+5%' },
];

const Analytics = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold mb-2">Research Analytics</h1>
        <p className="text-muted-foreground">
          Explore trends, metrics, and insights from the research landscape
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stat.trend} from last year
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topic Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={topicTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ML" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              <Line type="monotone" dataKey="NLP" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              <Line type="monotone" dataKey="CV" stroke="hsl(var(--chart-3))" strokeWidth={2} />
              <Line type="monotone" dataKey="Robotics" stroke="hsl(var(--chart-4))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Authors by PageRank</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={authorInfluenceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publication Distribution by Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={publicationDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {publicationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
