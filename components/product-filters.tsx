"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, FilterIcon, XIcon, Tag } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"

export type FilterState = {
  priceRange: [number, number]
  categories: string[]
  flavors: string[]
  searchQuery: string
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
  className?: string
  onApply?: () => void; // Add this line
  isStoreOnline?: boolean // Add this new prop
}

export function ProductFilters({ onFilterChange, initialFilters, onApply, className = "" }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters?.priceRange || [0, 2000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.categories || [])
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(initialFilters?.flavors || [])
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "")
  const [open, setOpen] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [searchFocused, setSearchFocused] = useState(false)
  const [flavorSearchQuery, setFlavorSearchQuery] = useState("")
  const [categorySearchQuery, setCategorySearchQuery] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { id: "chocolate-cake", label: "Chocolate Cake" },
    { id: "cheesecake", label: "Cheesecake" },
    { id: "cookie", label: "Cookie" },
    { id: "brownie", label: "Brownie" },
    { id: "dry-cake", label: "Dry Cake" },
    { id: "tart", label: "Tart" },
    { id: "jar-cake", label: "Jar Cake" },
    { id: "mousse", label: "Mousse" },
    { id: "muffin", label: "Muffin" },
    { id: "millet-magic", label: "Millet Magic" },
  ]

  const flavors = [
    { id: "chocolate", label: "Chocolate" },
    { id: "hazelnut", label: "Hazelnut" },
    { id: "oatmeal", label: "Oatmeal" },
    { id: "jeera", label: "Jeera" },
    { id: "saffron", label: "Saffron" },
    { id: "pistachio", label: "Pistachio" },
    { id: "coconut", label: "Coconut" },
    { id: "red-velvet", label: "Red Velvet" },
    { id: "ajwain", label: "Ajwain" },
    { id: "mango", label: "Mango" },
    { id: "strawberry", label: "Strawberry" },
    { id: "blueberry", label: "Blueberry" },
    { id: "pineapple", label: "Pineapple" },
    { id: "almonds", label: "Almonds" },
    { id: "ragi", label: "Ragi" },
    { id: "foxtail-millet", label: "Foxtail Millet" },
    { id: "nutella", label: "Nutella" },
    { id: "oreo", label: "Oreo" },
    { id: "lotus-biscoff", label: "Lotus Biscoff" },
    { id: "lemon", label: "Lemon" },
    { id: "coffee", label: "Coffee" },
    { id: "caramel", label: "Caramel" },
    { id: "rasmalai", label: "Rasmalai" },
    { id: "cherry", label: "Cherry" },
    { id: "cranberry", label: "Cranberry" },
    { id: "butterscotch", label: "Butterscotch" },
    { id: "tiramisu", label: "Tiramisu" },
    { id: "pina-colada", label: "Pina Colada" },
    { id: "litchi", label: "Litchi" },
    { id: "fruit", label: "Fruit" },
    { id: "nuts", label: "Nuts" },
    { id: "dates", label: "Dates" },
    { id: "cinnamon", label: "Cinnamon" },
    { id: "banana", label: "Banana" },
    { id: "quinoa", label: "Quinoa" },
    { id: "oat", label: "Oat" },
    { id: "barnyard-millet", label: "Barnyard Millet" },
    { id: "kodo-millet", label: "Kodo Millet" },
    { id: "browntop-millet", label: "Browntop Millet" },
    { id: "little-millet", label: "Little Millet" },
    { id: "vanilla", label: "Vanilla" },
  ]

  const filteredCategories = categories.filter(category =>
    category.label.toLowerCase().includes(categorySearchQuery.toLowerCase())
  )

  const filteredFlavors = flavors.filter(flavor =>
    flavor.label.toLowerCase().includes(flavorSearchQuery.toLowerCase())
  )

  useEffect(() => {
    // Count active filters
    let count = 0
    if (selectedCategories.length > 0) count++
    if (selectedFlavors.length > 0) count++
    if (searchQuery) count++
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++
    setActiveFiltersCount(count)
  }, [selectedCategories, selectedFlavors, searchQuery, priceRange])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) {
        return [...prev, categoryId]
      } else {
        return prev.filter((id) => id !== categoryId)
      }
    })
  }

  const handleFlavorChange = (flavorId: string, checked: boolean) => {
    setSelectedFlavors((prev) => {
      if (checked) {
        return [...prev, flavorId]
      } else {
        return prev.filter((id) => id !== flavorId)
      }
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
  }

  const applyFilters = () => {
    onFilterChange({
      priceRange,
      categories: selectedCategories,
      flavors: selectedFlavors,
      searchQuery,
    })
    setOpen(false)
  }

  const resetFilters = () => {
    setPriceRange([0, 2000])
    setSelectedCategories([])
    setSelectedFlavors([])
    setSearchQuery("")
    onFilterChange({
      priceRange: [0, 2000],
      categories: [],
      flavors: [],
      searchQuery: "",
    })
  }

  // Mobile drawer content
  const MobileFilterContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-1 overflow-hidden">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="categories" className="text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="flavors" className="text-xs sm:text-sm">Flavors</TabsTrigger>
            {/* <TabsTrigger value="price" className="text-xs sm:text-sm">Price</TabsTrigger> */}
          </TabsList>

          <TabsContent value="categories" className="mt-0">

            <ScrollArea className="h-[52vh] rounded-md pr-3">
              <div className="space-y-1">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${selectedCategories.includes(category.id)
                        ? "bg-pink-50"
                        : "hover:bg-gray-50"
                      }`}
                  >
                    <Checkbox
                      id={`mobile-category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      className={selectedCategories.includes(category.id) ? "text-pink-600" : ""}
                    />
                    <Label
                      htmlFor={`mobile-category-${category.id}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {category.label}
                    </Label>
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="py-4 text-center text-gray-500">No categories found</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="flavors" className="mt-0">

            <ScrollArea className="h-[50vh] rounded-md pr-3">
              <div className="space-y-1">
                {filteredFlavors.map((flavor) => (
                  <div
                    key={flavor.id}
                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${selectedFlavors.includes(flavor.id)
                        ? "bg-pink-50"
                        : "hover:bg-gray-50"
                      }`}
                  >
                    <Checkbox
                      id={`mobile-flavor-${flavor.id}`}
                      checked={selectedFlavors.includes(flavor.id)}
                      onCheckedChange={(checked) => handleFlavorChange(flavor.id, checked as boolean)}
                      className={selectedFlavors.includes(flavor.id) ? "text-pink-600" : ""}
                    />
                    <Label
                      htmlFor={`mobile-flavor-${flavor.id}`}
                      className="flex-1 text-sm cursor-pointer"
                    >
                      {flavor.label}
                    </Label>
                  </div>
                ))}
                {filteredFlavors.length === 0 && (
                  <div className="py-4 text-center text-gray-500">No flavors found</div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

        </Tabs>
      </div>

      <DrawerFooter className="mt-auto pt-2 pb-6 border-t">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-sm font-medium">Active filters: {activeFiltersCount}</span>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <Button
            onClick={applyFilters}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            Apply Filters
          </Button>
        </div>
      </DrawerFooter>
    </div>
  )

  // Desktop filter content
  const DesktopFilterContent = () => (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={[]} className="w-full">
        <AccordionItem value="categories" className="border-b border-gray-200">
          <AccordionTrigger className="py-3 text-base font-medium">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Categories</span>
              {selectedCategories.length > 0 && (
                <Badge className="ml-2 bg-pink-600">{selectedCategories.length}</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-2">

              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-1">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${selectedCategories.includes(category.id)
                          ? "bg-pink-50"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      <Checkbox
                        id={`desktop-category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                        className={selectedCategories.includes(category.id) ? "text-pink-600" : ""}
                      />
                      <Label
                        htmlFor={`desktop-category-${category.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        {category.label}
                      </Label>
                    </div>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="py-4 text-center text-gray-500">No categories found</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="flavors" className="border-b border-gray-200">
          <AccordionTrigger className="py-3 text-base font-medium">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21V19C3 17.9391 3.42143 16.9217 4.17157 16.1716C4.92172 15.4214 5.93913 15 7 15H17C18.0609 15 19.0783 15.4214 19.8284 16.1716C20.5786 16.9217 21 17.9391 21 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Flavors</span>
              {selectedFlavors.length > 0 && (
                <Badge className="ml-2 bg-pink-600">{selectedFlavors.length}</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-2">
              {/* <Input 
                placeholder="Search flavors..." 
                value={flavorSearchQuery}
                onChange={(e) => setFlavorSearchQuery(e.target.value)}
                className="mb-3"
              /> */}
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-1">
                  {filteredFlavors.map((flavor) => (
                    <div
                      key={flavor.id}
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${selectedFlavors.includes(flavor.id)
                          ? "bg-pink-50"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      <Checkbox
                        id={`desktop-flavor-${flavor.id}`}
                        checked={selectedFlavors.includes(flavor.id)}
                        onCheckedChange={(checked) => handleFlavorChange(flavor.id, checked as boolean)}
                        className={selectedFlavors.includes(flavor.id) ? "text-pink-600" : ""}
                      />
                      <Label
                        htmlFor={`desktop-flavor-${flavor.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        {flavor.label}
                      </Label>
                    </div>
                  ))}
                  {filteredFlavors.length === 0 && (
                    <div className="py-4 text-center text-gray-500">No flavors found</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-2">
        <Button
          className="w-full bg-pink-600 hover:bg-pink-700"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )

  // Active filters display component
  const ActiveFiltersDisplay = () => {
    if (activeFiltersCount === 0) return null

    return (
      <div className="mt-4 mb-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Active filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2"
          >
            <XIcon className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selectedCategories.map((category) => {
            const categoryLabel = categories.find(c => c.id === category)?.label
            return (
              <Badge
                key={category}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                {categoryLabel}
                <XIcon
                  className="h-3 w-3 cursor-pointer ml-1"
                  onClick={() => handleCategoryChange(category, false)}
                />
              </Badge>
            )
          })}
          {selectedFlavors.map((flavor) => {
            const flavorLabel = flavors.find(f => f.id === flavor)?.label
            return (
              <Badge
                key={flavor}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                {flavorLabel}
                <XIcon
                  className="h-3 w-3 cursor-pointer ml-1"
                  onClick={() => handleFlavorChange(flavor, false)}
                />
              </Badge>
            )
          })}

        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Search bar - visible on all screens */}
      <div className={`mb-5 transition-all ${searchFocused ? "md:w-full" : "md:w-3/4"}`}>
        <form
          onSubmit={handleSearch}
          className="relative group"
        >
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all ${searchFocused ? "text-pink-600" : "text-gray-400"
            }`}>
            <SearchIcon className="h-5 w-5" />
          </div>
          <Input
            ref={searchInputRef}
            placeholder="Search treats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`pl-10 transition-all pr-24 border-gray-200 focus-visible:ring-pink-600 ${searchFocused
                ? "border-pink-600 shadow-sm ring-2 ring-pink-50"
                : "hover:border-gray-300"
              }`}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-pink-600 hover:bg-pink-700 shadow-sm transition-all"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Filter controls - mobile vs desktop */}
      <div className="flex items-center justify-between mb-5">
        {isMobile ? (
          <Drawer open={open} onOpenChange={setOpen}>
            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <FilterIcon className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-pink-600">{activeFiltersCount}</Badge>
              )}
            </Button>
            <DrawerContent className="h-[90vh] max-h-[90vh] rounded-t-xl">
              <DrawerHeader className="border-b pb-3">
                <DrawerTitle className="text-left flex items-center gap-2">
                  <FilterIcon className="h-5 w-5" />
                  <span>Filters</span>
                </DrawerTitle>
              </DrawerHeader>
              <MobileFilterContent />
            </DrawerContent>
          </Drawer>
        ) : (
          <div className="hidden md:block md:w-52 lg:w-60 xl:w-72 flex-shrink-0">
            <h2 className="text-xl font-medium mb-4">Filters</h2>
            <DesktopFilterContent />
          </div>
        )}
      </div>

      {!isMobile && <ActiveFiltersDisplay />}
    </div>
  )
}