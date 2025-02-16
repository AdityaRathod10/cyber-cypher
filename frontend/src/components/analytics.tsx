"use client"

import React, { useState, useRef, useEffect } from "react"
import { ArrowUpRight, Upload, LineChart, BarChartIcon, Loader2, TrendingUp, Users, ShoppingCart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Transaction {
  id: string
  date: string
  amount: number
  customer: string
  product: string
  category: string
}

// Enhanced analytics functions
const calculateAnalytics = (data: Transaction[]) => {
  const totalSales = data.reduce((sum, item) => sum + item.amount, 0)
  const averageTransaction = totalSales / (data.length || 1)
  
  // Category analysis
  const categoryData = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount
    return acc
  }, {} as Record<string, number>)
  
  // Product analysis
  const productData = data.reduce((acc, item) => {
    acc[item.product] = (acc[item.product] || 0) + item.amount
    return acc
  }, {} as Record<string, number>)
  
  // Customer analysis
  const customerFrequency = data.reduce((acc, item) => {
    acc[item.customer] = (acc[item.customer] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Monthly data
  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleString("default", { month: "short" })
    acc[month] = (acc[month] || 0) + item.amount
    return acc
  }, {} as Record<string, number>)

  return {
    totalSales,
    averageTransaction,
    categoryData,
    productData,
    customerFrequency,
    monthlyData,
  }
}

const generateInsights = (analytics: ReturnType<typeof calculateAnalytics>) => {
  const topCategories = Object.entries(analytics.categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
  
  const topProducts = Object.entries(analytics.productData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
  
  const topCustomers = Object.entries(analytics.customerFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
  
  const monthlyTrend = Object.entries(analytics.monthlyData)
  const monthCount = monthlyTrend.length
  const latestMonth = monthlyTrend[monthCount - 1]
  const previousMonth = monthlyTrend[monthCount - 2]
  
  const monthlyGrowth = latestMonth && previousMonth
    ? ((latestMonth[1] - previousMonth[1]) / previousMonth[1] * 100).toFixed(1)
    : 0

  return `Key Business Insights:

1. Sales Performance
   • Total Revenue: ₹${analytics.totalSales.toLocaleString()}
   • Average Transaction: ₹${analytics.averageTransaction.toLocaleString()}
   • Monthly Growth: ${monthlyGrowth}%

2. Top Performing Categories
   ${topCategories.map((cat, i) => `• ${cat[0]}: ₹${cat[1].toLocaleString()}`).join('\n   ')}

3. Best Selling Products
   ${topProducts.map((prod, i) => `• ${prod[0]}: ₹${prod[1].toLocaleString()}`).join('\n   ')}

4. Customer Analysis
   ${topCustomers.map((cust, i) => `• ${cust[0]}: ${cust[1]} transactions`).join('\n   ')}

5. Recommendations:
   • ${Number(monthlyGrowth) > 0 ? 'Maintain growth momentum by focusing on successful products' : 'Focus on improving sales through targeted promotions'}
   • Consider loyalty programs for top customers
   • Optimize inventory based on category performance`
}

export function Analytics() {
  const [data, setData] = useState<Transaction[]>([])
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [insights, setInsights] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analytics = calculateAnalytics(data)
  const chartData = Object.entries(analytics.monthlyData).map(([name, value]) => ({
    name,
    value,
  }))

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) {
        toast({
          title: "Error",
          description: "Please select a CSV file",
          variant: "destructive",
        })
        return
      }

      setFileName(file.name)
      setChartLoading(true)

      const text = await file.text()
      const rows = text.split("\n").filter((row) => row.trim())
      const headers = rows[0].split(",")
      const transactions: Transaction[] = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(",")
        if (row.length === headers.length) {
          transactions.push({
            id: row[0]?.trim() || `TR-${i}`,
            date: row[1]?.trim() || new Date().toISOString(),
            amount: Number.parseFloat(row[2]?.trim() || "0"),
            customer: row[3]?.trim() || "Unknown",
            product: row[4]?.trim() || "Unknown",
            category: row[5]?.trim() || "Other",
          })
        }
      }

      if (transactions.length === 0) {
        throw new Error("No valid transactions found in CSV")
      }

      setData(transactions)
      toast({
        title: "CSV Uploaded Successfully",
        description: `Processed ${transactions.length} transactions`,
      })
    } catch (error) {
      console.error("CSV Upload Error:", error)
      toast({
        title: "Error Processing CSV",
        description: "Please check your CSV file format and try again",
        variant: "destructive",
      })
    } finally {
      setChartLoading(false)
    }
  }

  const handleGenerateInsights = () => {
    setLoading(true)
    try {
      const newInsights = generateInsights(analytics)
      setInsights(newInsights)
    } catch (error) {
      toast({
        title: "Error Generating Insights",
        description: "There was an error analyzing the data. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-2 border border-gray-800 rounded">
          <p className="text-gray-400">{label}</p>
          <p className="text-green-400">₹{payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">₹{analytics.totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Transaction</CardTitle>
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">₹{analytics.averageTransaction.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Transactions</CardTitle>
            <Users className="h-4 w-4 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">{data.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-400">Monthly Sales Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={chartType} onValueChange={(v) => setChartType(v as "bar" | "line")}>
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="bar">
                    <BarChartIcon className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="line">
                    <LineChart className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#22c55e" />
                  </BarChart>
                ) : (
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
                  </RechartsLineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleGenerateInsights}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            disabled={loading || data.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Insights...
              </>
            ) : (
              "Generate Insights"
            )}
          </Button>
          <div className="flex items-center gap-2">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="cursor-pointer bg-green-600 hover:bg-green-700 text-white border-green-500"
            >
              <Upload className="mr-2 h-4 w-4" />
              {fileName ? fileName : "Upload CSV"}
            </Button>
          </div>
        </div>

        {insights && (
          <Card className="bg-gray-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gray-400">Business Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <div className="text-green-400 whitespace-pre-line">{insights}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}