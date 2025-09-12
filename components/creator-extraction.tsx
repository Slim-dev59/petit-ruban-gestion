"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Info } from "lucide-react"
import { useStore } from "@/lib/store"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreatorExtraction() {
  const { stockData, creators } = useStore()

  // Analyser les données pour montrer les créateurs détectés
  const detectedCreators = [...new Set(stockData.map((item) => item.createur))].filter((c) => c.trim() !== "")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Extraction automatique des créateurs
          </CardTitle>
          <CardDescription>
            Les créateurs sont automatiquement extraits du nom des articles (Item name) lors de l'import du stock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Nouvelle logique :</strong> Le créateur correspond au nom de l'article (Item name) et l'article
              correspond à la variation. Cette extraction se fait automatiquement lors de l'import du fichier stock.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">Créateurs détectés dans le stock ({detectedCreators.length})</h4>
            <div className="flex flex-wrap gap-2">
              {detectedCreators.map((creator) => (
                <Badge key={creator} variant="secondary">
                  {creator}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Créateurs configurés ({creators.length})</h4>
            <div className="flex flex-wrap gap-2">
              {creators.map((creator) => (
                <Badge key={creator} variant="default">
                  {creator}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aperçu de la structure</CardTitle>
          <CardDescription>Vérifiez comment les données sont interprétées</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Créateur (Item name)</TableHead>
                <TableHead>Article (Variations)</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>SKU</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.slice(0, 10).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="outline">{item.createur}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.article}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.price}€</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {stockData.length > 10 && (
            <p className="text-sm text-muted-foreground mt-2">... et {stockData.length - 10} autres articles</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Règles d'extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Créateur</strong> : Correspond au champ "Item name" du fichier d'import
          </p>
          <p>
            • <strong>Article</strong> : Correspond au champ "Variations" du fichier d'import
          </p>
          <p>
            • <strong>Ajout automatique</strong> : Les créateurs sont automatiquement ajoutés à la liste lors de
            l'import
          </p>
          <p>
            • <strong>Recherche ventes</strong> : Lors de l'import des ventes, la recherche se fait dans les 4 premiers
            mots de la description
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
