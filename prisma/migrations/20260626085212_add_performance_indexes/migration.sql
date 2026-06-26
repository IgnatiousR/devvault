-- CreateIndex
CREATE INDEX "item_collections_itemId_idx" ON "item_collections"("itemId");

-- CreateIndex
CREATE INDEX "item_collections_collectionId_idx" ON "item_collections"("collectionId");

-- CreateIndex
CREATE INDEX "items_userId_isPinned_idx" ON "items"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "items_userId_updatedAt_idx" ON "items"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "items_userId_itemTypeId_idx" ON "items"("userId", "itemTypeId");
